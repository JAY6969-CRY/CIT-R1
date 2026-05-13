import os
import re
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Argument Archaeologist API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """You are a relationship forensics AI. Analyze this WhatsApp group chat and return ONLY a valid JSON object with this exact structure:
{
  "turning_point": {
    "timestamp": "...",
    "sender": "...",
    "message": "...",
    "reason": "..."
  },
  "characters": [
    {
      "name": "...",
      "role": "Instigator | Peacemaker | Silent Fuel-Adder | Escape Artist | Neutral",
      "evidence": "...",
      "toxicity_score": <integer 0-100>
    }
  ],
  "timeline": [
    {
      "timestamp": "...",
      "tension_level": <integer 0-100>,
      "event": "..."
    }
  ],
  "summary": "..."
}
Return ONLY the JSON. No explanation. No markdown. No extra text."""


class ChatInput(BaseModel):
    chat: str


def parse_whatsapp_chat(raw_text: str) -> list[dict]:
    """Parse WhatsApp chat export into structured messages.
    
    Supports multiple WhatsApp export formats:
    - Format A: DD/MM/YY, HH:MM AM/PM - Sender: Message
    - Format B: [DD/MM/YY, HH:MM:SS AM/PM] Sender: Message
    - Format C: DD/MM/YY, HH:MM - Sender: Message (24h)
    - Format D: [DD/MM/YY, HH:MM:SS] Sender: Message (24h)
    """
    messages = []
    patterns = [
        # Format B & New Format: [DD/MM/YY, HH:MM:SS AM/PM] or [MM/DD, HH:MM AM/PM] Sender: Message
        re.compile(
            r"\[(\d{1,2}/\d{1,2}(?:/\d{2,4})?,\s*\d{1,2}:\d{2}(?::\d{2})?\s*[APap][Mm])\]\s*([^:]+):\s*(.*)"
        ),
        # Format D & New Format: [DD/MM/YY, HH:MM:SS] or [MM/DD, HH:MM] Sender: Message (24h)
        re.compile(
            r"\[(\d{1,2}/\d{1,2}(?:/\d{2,4})?,\s*\d{1,2}:\d{2}(?::\d{2})?)\]\s*([^:]+):\s*(.*)"
        ),
        # Format A: DD/MM/YY, HH:MM AM/PM - Sender: Message (or without year)
        re.compile(
            r"(\d{1,2}/\d{1,2}(?:/\d{2,4})?,\s*\d{1,2}:\d{2}(?::\d{2})?\s*[APap][Mm])\s*-\s*([^:]+):\s*(.*)"
        ),
        # Format C: DD/MM/YY, HH:MM - Sender: Message (24h or without year)
        re.compile(
            r"(\d{1,2}/\d{1,2}(?:/\d{2,4})?,\s*\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*([^:]+):\s*(.*)"
        ),
    ]
    for line in raw_text.strip().split("\n"):
        stripped = line.strip()
        for pattern in patterns:
            match = pattern.match(stripped)
            if match:
                timestamp, sender, message = match.groups()
                sender = sender.strip()
                message = message.strip()
                # Skip system messages
                if message and sender and not any(
                    skip in message.lower()
                    for skip in [
                        "messages and calls are end-to-end encrypted",
                        "created group",
                        "added you",
                        "changed the group",
                        "changed this group",
                        "pinned a message",
                        "you pinned",
                        "this message was deleted",
                        "was deleted by admin",
                    ]
                ):
                    messages.append(
                        {
                            "timestamp": timestamp.strip(),
                            "sender": sender,
                            "message": message,
                        }
                    )
                break
    return messages


@app.post("/analyze")
@app.post("/api/analyze")
async def analyze_chat(data: ChatInput):
    if not data.chat or not data.chat.strip():
        raise HTTPException(status_code=400, detail="Chat text is required")

    parsed_messages = parse_whatsapp_chat(data.chat)

    if not parsed_messages:
        raise HTTPException(
            status_code=400,
            detail="Could not parse any messages. Please check the WhatsApp chat format.",
        )

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": str(parsed_messages)},
            ],
        )

        result = json.loads(response.choices[0].message.content)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
