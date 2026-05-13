import { useState, useRef } from 'react'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts'

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:8000'

const ROLE_COLORS = {
  Instigator: '#ff4d4d',
  Peacemaker: '#22c55e',
  'Silent Fuel-Adder': '#f97316',
  'Escape Artist': '#3b82f6',
  Neutral: '#6b7280',
}

const SAMPLE_CHATS = [
  {
    name: '🔥 Friend Group Drama',
    description: 'Birthday party gone wrong',
    chat: `12/04/25, 10:30 AM - Rahul: yo who's coming to my birthday tomorrow
12/04/25, 10:31 AM - Priya: wait what?? you didn't even invite me properly
12/04/25, 10:31 AM - Arjun: lmaooo she's mad
12/04/25, 10:32 AM - Priya: shut up arjun this isn't funny
12/04/25, 10:32 AM - Rahul: bro I posted it in the group last week
12/04/25, 10:33 AM - Priya: that's not a proper invite and you know it
12/04/25, 10:33 AM - Sneha: guys calm down it's just a party
12/04/25, 10:34 AM - Arjun: "just a party" lol sneha always the diplomat
12/04/25, 10:34 AM - Priya: no sneha he literally invited everyone personally except me
12/04/25, 10:35 AM - Rahul: that's not true I forgot ok?? I'm sorry
12/04/25, 10:35 AM - Priya: you forgot. wow. thanks rahul really shows how much I matter
12/04/25, 10:36 AM - Arjun: drama queen alert 🚨
12/04/25, 10:36 AM - Priya: I swear arjun one more comment and I'm leaving this group
12/04/25, 10:37 AM - Sneha: arjun stop adding fuel please
12/04/25, 10:37 AM - Rahul: priya I said I'm sorry what else do you want me to do
12/04/25, 10:38 AM - Priya: maybe actually care about your friends for once
12/04/25, 10:38 AM - Arjun: yikes
12/04/25, 10:39 AM - Sneha: ok everyone take a breath. rahul just call her and sort it out
12/04/25, 10:40 AM - Rahul: fine I'll call you priya. happy?
12/04/25, 10:41 AM - Priya: whatever`
  },
  {
    name: '🏠 Roommate Conflict',
    description: 'Dishes, rent, and passive aggression',
    chat: `03/15/25, 9:00 PM - Amit: who left dishes in the sink AGAIN
03/15/25, 9:01 PM - Kavya: wasn't me I've been out all day
03/15/25, 9:01 PM - Rohan: bro chill it's just dishes
03/15/25, 9:02 PM - Amit: "just dishes" you say that every week rohan
03/15/25, 9:02 PM - Rohan: because it IS just dishes lol
03/15/25, 9:03 PM - Kavya: actually rohan you did cook last night and I don't think you cleaned up
03/15/25, 9:03 PM - Rohan: wow thanks for throwing me under the bus kavya
03/15/25, 9:04 PM - Amit: also rent is due tomorrow and I'm tired of reminding everyone
03/15/25, 9:04 PM - Rohan: I'll pay when I get paid relax
03/15/25, 9:05 PM - Amit: you said that last month too and I had to cover for you
03/15/25, 9:05 PM - Kavya: ok this is getting toxic. can we have a house meeting instead of fighting on whatsapp?
03/15/25, 9:06 PM - Rohan: house meeting lmao we're not in college anymore
03/15/25, 9:06 PM - Amit: maybe if you acted like an adult we wouldn't need one
03/15/25, 9:07 PM - Rohan: wow ok personal attacks now nice
03/15/25, 9:08 PM - Kavya: GUYS. STOP. tomorrow 7pm we're sitting down and talking like adults. no more texting about this
03/15/25, 9:09 PM - Amit: fine
03/15/25, 9:10 PM - Rohan: whatever`
  },
  {
    name: '✈️ Trip Planning Meltdown',
    description: 'Budget fights and destination wars',
    chat: `05/20/25, 3:00 PM - Meera: ok so Goa trip next month. everyone in?
05/20/25, 3:01 PM - Vikram: yesss finally
05/20/25, 3:01 PM - Deepa: wait how much is this gonna cost
05/20/25, 3:02 PM - Meera: around 15k per person for 4 days
05/20/25, 3:02 PM - Deepa: 15K?? that's way too much for me rn
05/20/25, 3:03 PM - Vikram: we can find cheaper stays cmon
05/20/25, 3:03 PM - Sanjay: why Goa again? let's do Pondicherry
05/20/25, 3:04 PM - Meera: because we already VOTED on Goa sanjay
05/20/25, 3:04 PM - Sanjay: that vote was rigged lol deepa wasn't even there
05/20/25, 3:05 PM - Deepa: yeah actually I would prefer Pondi it's cheaper
05/20/25, 3:05 PM - Meera: great so now we're back to square one. thanks sanjay
05/20/25, 3:06 PM - Vikram: guys can we just decide and stop going in circles
05/20/25, 3:06 PM - Sanjay: I'm just saying there are options
05/20/25, 3:07 PM - Meera: there WERE options. we decided. you're undoing it
05/20/25, 3:07 PM - Deepa: meera don't get so stressed it's supposed to be fun
05/20/25, 3:08 PM - Meera: it WAS fun until people started changing plans every 5 minutes
05/20/25, 3:09 PM - Vikram: ok new plan. everyone DM me your budget and preference. I'll make a spreadsheet
05/20/25, 3:10 PM - Sanjay: spreadsheet for a vacation lmaooo
05/20/25, 3:10 PM - Meera: I'm done. you guys figure it out
05/20/25, 3:11 PM - Deepa: meera come back...
05/20/25, 3:12 PM - Vikram: great. she left`
  },
  {
    name: '📚 Study Group Tension',
    description: 'Project deadlines and free-riders',
    chat: `11/08/25, 11:00 PM - Ananya: the presentation is tomorrow and nobody has done their slides
11/08/25, 11:01 PM - Karthik: I did mine check the drive
11/08/25, 11:01 PM - Ananya: yours is literally 2 slides with no content karthik
11/08/25, 11:02 PM - Riya: I'll finish mine by morning don't worry
11/08/25, 11:02 PM - Ananya: you said that 3 days ago riya
11/08/25, 11:03 PM - Karthik: relax we always figure it out last minute
11/08/25, 11:03 PM - Ananya: that's because I stay up all night fixing everyone's work
11/08/25, 11:04 PM - Nikhil: sorry guys I completely forgot about this
11/08/25, 11:04 PM - Ananya: FORGOT?? it's worth 30% of our grade nikhil
11/08/25, 11:05 PM - Riya: ananya breathe. we'll get it done
11/08/25, 11:05 PM - Ananya: easy for you to say you haven't done anything either
11/08/25, 11:06 PM - Karthik: ok that was harsh
11/08/25, 11:06 PM - Ananya: harsh?? I've been carrying this team all semester
11/08/25, 11:07 PM - Nikhil: look I'll do 5 slides right now. just tell me what topics
11/08/25, 11:07 PM - Riya: same I'm opening my laptop now
11/08/25, 11:08 PM - Ananya: topics were assigned 2 WEEKS ago. check the doc
11/08/25, 11:09 PM - Karthik: she's right guys we dropped the ball
11/08/25, 11:10 PM - Nikhil: ok found it. working on it now. sorry ananya
11/08/25, 11:11 PM - Ananya: just... please actually do it this time`
  },
  {
    name: '👨‍👩‍👧‍👦 Family Group Chaos',
    description: 'Wedding planning disagreements',
    chat: `01/10/25, 6:00 PM - Mom: beta the wedding venue needs to be booked THIS WEEK
01/10/25, 6:01 PM - Priya: mom I told you we want a small wedding
01/10/25, 6:01 PM - Dad: small wedding means 200 people right?
01/10/25, 6:02 PM - Priya: DAD. 200 is not small. we said 80 max
01/10/25, 6:02 PM - Mom: 80?? I can't even fit my side of the family in 80
01/10/25, 6:03 PM - Bhai: lol this is gonna be good
01/10/25, 6:03 PM - Priya: not helpful bhai
01/10/25, 6:04 PM - Mom: your maasi will be so hurt if she's not invited
01/10/25, 6:04 PM - Priya: which maasi? I have 6 of them apparently
01/10/25, 6:05 PM - Dad: all of them obviously
01/10/25, 6:05 PM - Priya: then it's already 150 with just relatives!!
01/10/25, 6:06 PM - Mom: exactly that's why 80 is impossible beta
01/10/25, 6:06 PM - Bhai: just elope honestly 😂
01/10/25, 6:07 PM - Mom: WHAT kind of advice is this?? you want me to have a heart attack?
01/10/25, 6:07 PM - Priya: it's MY wedding why doesn't anyone listen to what I want
01/10/25, 6:08 PM - Dad: we are listening. we're just saying 80 is not practical
01/10/25, 6:08 PM - Priya: not practical or not what YOU want? there's a difference
01/10/25, 6:09 PM - Mom: I just want my daughter's wedding to be beautiful is that so wrong
01/10/25, 6:10 PM - Priya: it will be beautiful mom. just smaller
01/10/25, 6:11 PM - Bhai: compromise at 120?
01/10/25, 6:11 PM - Priya: ...fine. 120. final answer
01/10/25, 6:12 PM - Mom: ok 150
01/10/25, 6:12 PM - Priya: MOM`
  }
]

function getToxicityColor(score) {
  if (score >= 75) return '#ff4d4d'
  if (score >= 50) return '#f97316'
  if (score >= 25) return '#facc15'
  return '#22c55e'
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: 10,
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <p style={{ color: '#999', fontSize: 12, margin: 0 }}>{label}</p>
      <p style={{ color: '#ff4d4d', fontSize: 18, fontWeight: 700, margin: '4px 0 0' }}>
        Tension: {payload[0].value}
      </p>
      {payload[0].payload.event && (
        <p style={{ color: '#ccc', fontSize: 12, margin: '6px 0 0', maxWidth: 220 }}>
          {payload[0].payload.event}
        </p>
      )}
    </div>
  )
}

export default function App() {
  const [chatText, setChatText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResults, setShowResults] = useState(false)
  const resultRef = useRef(null)

  async function handleAnalyze() {
    if (!chatText.trim()) {
      setError('Please paste a WhatsApp chat export first.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    setShowResults(false)

    try {
      const res = await axios.post(`${API_URL}/api/analyze`, { chat: chatText })
      setResult(res.data)
      setShowResults(true)
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Check backend connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        *, *::before, *::after {
          margin: 0; padding: 0; box-sizing: border-box;
        }
        html { scroll-behavior: smooth; }
        body {
          background: #0f0f0f;
          color: #e5e5e5;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255,77,77,0.15); }
          50% { box-shadow: 0 0 40px rgba(255,77,77,0.3); }
        }
        .app-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 32px 24px;
          min-height: 100vh;
        }
        .main-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .main-layout {
            grid-template-columns: 1fr;
          }
        }

        /* Left Panel */
        .left-panel {
          position: sticky;
          top: 32px;
        }
        @media (max-width: 960px) {
          .left-panel { position: static; }
        }
        .title {
          font-size: 2.8rem;
          font-weight: 900;
          color: #fff;
          letter-spacing: -1.5px;
          line-height: 1.1;
          margin-bottom: 8px;
        }
        .title-accent {
          background: linear-gradient(135deg, #ff4d4d, #ff8a4d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .subtitle {
          color: #777;
          font-size: 1rem;
          font-weight: 400;
          margin-bottom: 28px;
        }
        .textarea-wrapper {
          position: relative;
          margin-bottom: 20px;
        }
        .chat-textarea {
          width: 100%;
          min-height: 340px;
          background: #111;
          border: 2px solid #2a2a2a;
          border-radius: 14px;
          color: #d4d4d4;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          padding: 20px;
          resize: vertical;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          line-height: 1.7;
        }
        .chat-textarea::placeholder {
          color: #444;
        }
        .chat-textarea:focus {
          border-color: #ff4d4d;
          box-shadow: 0 0 0 4px rgba(255,77,77,0.1), 0 0 30px rgba(255,77,77,0.05);
        }
        .line-count {
          position: absolute;
          bottom: 14px;
          right: 16px;
          font-size: 11px;
          color: #555;
          font-family: 'JetBrains Mono', monospace;
          pointer-events: none;
        }
        .analyze-btn {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #ff4d4d, #e63636);
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
        }
        .analyze-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(255,77,77,0.4);
        }
        .analyze-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .analyze-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .analyze-btn .shimmer-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        .spinner {
          display: inline-block;
          width: 20px; height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 10px;
        }
        .error-msg {
          margin-top: 16px;
          padding: 14px 18px;
          background: rgba(255,77,77,0.1);
          border: 1px solid rgba(255,77,77,0.3);
          border-radius: 10px;
          color: #ff6b6b;
          font-size: 14px;
        }
        .helper-text {
          margin-top: 20px;
          padding: 16px;
          background: #161616;
          border-radius: 10px;
          border: 1px solid #222;
        }
        .helper-text h4 {
          color: #888;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        .helper-text p {
          color: #555;
          font-size: 13px;
          line-height: 1.6;
        }

        /* Right Panel / Results */
        .right-panel {
          animation: fadeInUp 0.6s ease both;
        }
        .card {
          background: #1a1a1a;
          border: 1px solid #262626;
          border-radius: 16px;
          padding: 28px;
          margin-bottom: 24px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          border-color: #333;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .card-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 18px;
          letter-spacing: -0.5px;
        }

        /* Turning Point */
        .turning-point-card {
          animation: glowPulse 3s ease-in-out infinite;
          border-color: rgba(255,77,77,0.3);
        }
        .tp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .tp-sender {
          font-size: 1.1rem;
          font-weight: 700;
          color: #ff4d4d;
        }
        .tp-time {
          font-size: 0.8rem;
          color: #666;
          font-family: 'JetBrains Mono', monospace;
        }
        .tp-message {
          background: rgba(255,77,77,0.08);
          border-left: 4px solid #ff4d4d;
          padding: 16px 20px;
          border-radius: 0 12px 12px 0;
          font-size: 1.05rem;
          color: #e5e5e5;
          margin-bottom: 16px;
          font-style: italic;
        }
        .tp-reason {
          padding: 14px 18px;
          background: rgba(255,77,77,0.06);
          border: 1px solid rgba(255,77,77,0.15);
          border-radius: 10px;
          color: #ccc;
          font-size: 0.9rem;
          line-height: 1.6;
        }
        .tp-reason-label {
          color: #ff4d4d;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }

        /* Character Cards */
        .char-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .char-card {
          background: #161616;
          border: 1px solid #252525;
          border-radius: 14px;
          padding: 22px;
          transition: all 0.3s ease;
        }
        .char-card:hover {
          border-color: #333;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0,0,0,0.3);
        }
        .char-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .char-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
        }
        .role-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .toxicity-wrapper {
          margin-bottom: 14px;
        }
        .toxicity-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #777;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .toxicity-bar-bg {
          height: 8px;
          background: #222;
          border-radius: 10px;
          overflow: hidden;
        }
        .toxicity-bar-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .char-evidence {
          font-size: 0.85rem;
          color: #999;
          line-height: 1.6;
          border-top: 1px solid #222;
          padding-top: 12px;
        }
        .char-evidence::before {
          content: '"';
          color: #555;
          font-size: 1.5rem;
          line-height: 0;
          vertical-align: -6px;
          margin-right: 2px;
        }
        .char-evidence::after {
          content: '"';
          color: #555;
          font-size: 1.5rem;
          line-height: 0;
          vertical-align: -6px;
          margin-left: 2px;
        }

        /* Timeline Chart */
        .chart-wrapper {
          background: #111;
          border-radius: 12px;
          padding: 20px 12px 12px;
        }

        /* Summary */
        .summary-text {
          font-size: 1rem;
          color: #bbb;
          line-height: 1.8;
          letter-spacing: 0.2px;
        }

        /* Loading State */
        .loading-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          animation: fadeInUp 0.4s ease;
        }
        .loading-ring {
          width: 56px; height: 56px;
          border: 4px solid #222;
          border-top-color: #ff4d4d;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 24px;
        }
        .loading-text {
          color: #666;
          font-size: 0.95rem;
          animation: pulse 1.5s ease infinite;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0f0f0f; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #444; }

        /* Empty state */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 40px;
          text-align: center;
        }
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          opacity: 0.3;
        }
        .empty-title {
          color: #444;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .empty-desc {
          color: #333;
          font-size: 0.85rem;
        }

        /* Sample Templates */
        .templates-section {
          margin-top: 20px;
        }
        .templates-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .templates-label {
          color: #888;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .templates-divider {
          flex: 1;
          height: 1px;
          background: #222;
        }
        .templates-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 500px) {
          .templates-grid {
            grid-template-columns: 1fr;
          }
        }
        .template-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          padding: 14px 16px;
          background: #141414;
          border: 1px solid #222;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s ease;
          text-align: left;
          font-family: 'Inter', sans-serif;
        }
        .template-btn:hover {
          background: #1a1a1a;
          border-color: #ff4d4d44;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(255,77,77,0.08);
        }
        .template-btn.active {
          border-color: #ff4d4d;
          background: rgba(255,77,77,0.06);
        }
        .template-btn-name {
          color: #ddd;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .template-btn-desc {
          color: #555;
          font-size: 0.72rem;
        }
        .template-loaded-toast {
          margin-top: 10px;
          padding: 10px 14px;
          background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 8px;
          color: #22c55e;
          font-size: 13px;
          animation: fadeInUp 0.3s ease both;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      <div className="app-container">
        <div className="main-layout">
          {/* LEFT PANEL */}
          <div className="left-panel">
            <h1 className="title">
              <span className="title-accent">Argument</span>
              <br />
              Archaeologist 🌀
            </h1>
            <p className="subtitle">Paste your WhatsApp chat export below</p>

            <div className="textarea-wrapper">
              <textarea
                id="chat-input"
                className="chat-textarea"
                placeholder={`12/04/25, 10:32 AM - Rahul: bro what the hell\n12/04/25, 10:33 AM - Priya: calm down its not a big deal\n12/04/25, 10:34 AM - Arjun: lmaooo`}
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                spellCheck={false}
              />
              <span className="line-count">
                {chatText ? chatText.split('\n').filter(l => l.trim()).length : 0} lines
              </span>
            </div>

            <button
              id="analyze-btn"
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="shimmer-overlay" />
                  🔍 Analyze Chat
                </>
              )}
            </button>

            {error && <div className="error-msg">{error}</div>}

            {/* SAMPLE TEMPLATES */}
            <div className="templates-section">
              <div className="templates-header">
                <span className="templates-label">📋 Or try a sample chat</span>
                <div className="templates-divider" />
              </div>
              <div className="templates-grid">
                {SAMPLE_CHATS.map((sample, i) => (
                  <button
                    key={i}
                    className={`template-btn${chatText === sample.chat ? ' active' : ''}`}
                    onClick={() => {
                      setChatText(sample.chat)
                      setError('')
                    }}
                  >
                    <span className="template-btn-name">{sample.name}</span>
                    <span className="template-btn-desc">{sample.description}</span>
                  </button>
                ))}
              </div>
              {chatText && SAMPLE_CHATS.some(s => s.chat === chatText) && (
                <div className="template-loaded-toast">
                  ✅ Sample loaded — hit Analyze to excavate!
                </div>
              )}
            </div>

            <div className="helper-text">
              <h4>How to export</h4>
              <p>
                Open WhatsApp → Tap the group → ⋮ More → Export chat → Without Media → Copy or share the .txt file.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="right-panel" ref={resultRef}>
            {loading && (
              <div className="loading-overlay">
                <div className="loading-ring" />
                <p className="loading-text">Excavating the argument layers...</p>
              </div>
            )}

            {!loading && !result && (
              <div className="empty-state">
                <div className="empty-icon">🏺</div>
                <p className="empty-title">No excavation yet</p>
                <p className="empty-desc">Paste a chat and hit Analyze to begin</p>
              </div>
            )}

            {showResults && result && (
              <>
                {/* TURNING POINT */}
                {result.turning_point && (
                  <div className="card turning-point-card" id="turning-point" style={{ animationDelay: '0.1s', animation: 'fadeInUp 0.5s ease both, glowPulse 3s ease-in-out infinite' }}>
                    <div className="card-title">💥 The Turning Point</div>
                    <div className="tp-header">
                      <span className="tp-sender">{result.turning_point.sender}</span>
                      <span className="tp-time">{result.turning_point.timestamp}</span>
                    </div>
                    <div className="tp-message">
                      {result.turning_point.message}
                    </div>
                    <div className="tp-reason">
                      <div className="tp-reason-label">Why this mattered</div>
                      {result.turning_point.reason}
                    </div>
                  </div>
                )}

                {/* CHARACTER PROFILES */}
                {result.characters && result.characters.length > 0 && (
                  <div className="card" id="character-profiles" style={{ animation: 'fadeInUp 0.5s ease both', animationDelay: '0.2s' }}>
                    <div className="card-title">👤 Character Profiles</div>
                    <div className="char-grid">
                      {result.characters.map((char, i) => {
                        const roleColor = ROLE_COLORS[char.role] || '#6b7280'
                        const toxColor = getToxicityColor(char.toxicity_score)
                        return (
                          <div
                            className="char-card"
                            key={i}
                            style={{ animation: 'fadeInUp 0.5s ease both', animationDelay: `${0.3 + i * 0.1}s` }}
                          >
                            <div className="char-header">
                              <span className="char-name">{char.name}</span>
                              <span
                                className="role-badge"
                                style={{
                                  background: `${roleColor}18`,
                                  color: roleColor,
                                  border: `1px solid ${roleColor}40`,
                                }}
                              >
                                {char.role}
                              </span>
                            </div>
                            <div className="toxicity-wrapper">
                              <div className="toxicity-label">
                                <span>Toxicity</span>
                                <span style={{ color: toxColor, fontWeight: 700 }}>{char.toxicity_score}%</span>
                              </div>
                              <div className="toxicity-bar-bg">
                                <div
                                  className="toxicity-bar-fill"
                                  style={{
                                    width: `${char.toxicity_score}%`,
                                    background: `linear-gradient(90deg, ${toxColor}, ${toxColor}aa)`,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="char-evidence">{char.evidence}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* TENSION TIMELINE */}
                {result.timeline && result.timeline.length > 0 && (
                  <div className="card" id="tension-timeline" style={{ animation: 'fadeInUp 0.5s ease both', animationDelay: '0.4s' }}>
                    <div className="card-title">📈 Tension Timeline</div>
                    <div className="chart-wrapper">
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={result.timeline} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="tensionGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ff4d4d" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#ff4d4d" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                          <XAxis
                            dataKey="timestamp"
                            tick={{ fill: '#555', fontSize: 11 }}
                            tickLine={{ stroke: '#333' }}
                            axisLine={{ stroke: '#333' }}
                          />
                          <YAxis
                            domain={[0, 100]}
                            tick={{ fill: '#555', fontSize: 11 }}
                            tickLine={{ stroke: '#333' }}
                            axisLine={{ stroke: '#333' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="tension_level"
                            stroke="#ff4d4d"
                            strokeWidth={3}
                            fill="url(#tensionGradient)"
                            dot={{ fill: '#ff4d4d', r: 4, strokeWidth: 2, stroke: '#1a1a1a' }}
                            activeDot={{ r: 7, stroke: '#ff4d4d', strokeWidth: 2, fill: '#fff' }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* SUMMARY */}
                {result.summary && (
                  <div className="card" id="relationship-summary" style={{ animation: 'fadeInUp 0.5s ease both', animationDelay: '0.5s' }}>
                    <div className="card-title">🧠 Relationship Summary</div>
                    <p className="summary-text">{result.summary}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
