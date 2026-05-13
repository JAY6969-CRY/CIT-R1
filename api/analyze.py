import os
import re
import json
from http.server import BaseHTTPRequestHandler


def parse_whatsapp_chat(raw_text: str) -> list:
    """Parse WhatsApp chat export into structured messages.

    Supports multiple WhatsApp export formats:
    - Format A: DD/MM/YY, HH:MM AM/PM - Sender: Message
    - Format B: [DD/MM/YY, HH:MM:SS AM/PM] Sender: Message
    - Format C: DD/MM/YY, HH:MM - Sender: Message (24h)
    - Format D: [DD/MM/YY, HH:MM:SS] Sender: Message (24h)
    """
    messages = []
    patterns = [
        # Format B: [DD/MM/YY, HH:MM:SS AM/PM] Sender: Message
        re.compile(
            r"\[(\d{1,2}/\d{1,2}/\d{2,4},\s*\d{1,2}:\d{2}(?::\d{2})?\s*[APap][Mm])\]\s*([^:]+):\s*(.*)"
        ),
        # Format D: [DD/MM/YY, HH:MM:SS] Sender: Message (24h)
        re.compile(
            r"\[(\d{1,2}/\d{1,2}/\d{2,4},\s*\d{1,2}:\d{2}(?::\d{2})?)\]\s*([^:]+):\s*(.*)"
        ),
        # Format A: DD/MM/YY, HH:MM AM/PM - Sender: Message
        re.compile(
            r"(\d{1,2}/\d{1,2}/\d{2,4},\s*\d{1,2}:\d{2}(?::\d{2})?\s*[APap][Mm])\s*-\s*([^:]+):\s*(.*)"
        ),
        # Format C: DD/MM/YY, HH:MM - Sender: Message (24h)
        re.compile(
            r"(\d{1,2}/\d{1,2}/\d{2,4},\s*\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*([^:]+):\s*(.*)"
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


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)

            chat_text = data.get("chat", "").strip()
            if not chat_text:
                self._send_error(400, "Chat text is required")
                return

            parsed_messages = parse_whatsapp_chat(chat_text)
            if not parsed_messages:
                self._send_error(
                    400,
                    "Could not parse any messages. Please check the WhatsApp chat format.",
                )
                return

            from openai import OpenAI

            client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

            system_prompt = """You are a relationship forensics AI. Analyze this WhatsApp group chat and return ONLY a valid JSON object with this exact structure:
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

            response = client.chat.completions.create(
                model="gpt-4o",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": str(parsed_messages)},
                ],
            )

            result = json.loads(response.choices[0].message.content)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())

        except Exception as e:
            self._send_error(500, f"Analysis failed: {str(e)}")

    def _send_error(self, code, detail):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"detail": detail}).encode())
