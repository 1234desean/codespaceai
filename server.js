// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const dna = require('./dnaEngine');
const emo = require('./emotionEngine');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body || {};
  if (!message) return res.status(400).json({ error: 'No message' });

  // 1) analyze emotion
  const emotion = emo.detectEmotion(message);

  // 2) record sensory-like "trace" into DNA (simulated)
  const sensory = {
    text: message,
    time: Date.now(),
    features: emo.extractFeatures(message),
  };
  dna.record(sessionId || 'default', sensory);

  // 3) produce response by mixing templates with DNA playback influence
  const playback = dna.playback(sessionId || 'default', { length: 3, reverse: true });

  const reply = generateReply(message, emotion, playback);

  // 4) optionally update DNA with patterns from reply
  dna.update(sessionId || 'default', { reply, emotion, time: Date.now() });

  res.json({ reply, emotion, playback });
});

function generateReply(message, emotion, playback) {
  // Base templates tuned to emotional tone
  const toneTemplates = {
    neutral: [
      "I hear you. Tell me more about that.",
      "That's interesting. What happened next?",
      "Okay — let's explore that."
    ],
    warm: [
      "That feels gentle. I can sense warmth in your words.",
      "I like that. It sounds comforting.",
      "You describe that so kindly — tell me more."
    ],
    curious: [
      "Hmm — curious. Why do you think that happened?",
      "That's interesting — what else do you notice?",
      "I want to understand more — can you show me?"
    ],
    sad: [
      "I'm sorry you felt that. Do you want to talk about it?",
      "That sounds heavy. I'm here with you.",
      "I feel the weight in your words. Tell me what you need."
    ],
    angry: [
      "I can sense anger. What would make this better?",
      "That's intense — want to unpack it together?",
      "Anger is real. Let's try to understand where it's coming from."
    ],
    dreamlike: [
      "It reads like a dream — images and echoes.",
      "This feels like a playback, like memory in a mirror.",
      "You saw it backwards — what does that mean now?"
    ]
  };

  // choose tone
  const tone = emotion.tone || 'neutral';
  const pool = toneTemplates[tone] || toneTemplates['neutral'];

  // influence from playback (DNA): if playback has short strings, weave them in
  const playbackHint = playback.length ? ` (echoes: ${playback.slice(0,2).map(p=>p.text.replace(/\s+/g,' ').slice(0,40)).join(' | ')})` : '';

  // simple selection
  const base = pool[Math.floor(Math.random() * pool.length)];

  // if message contains trigger words, prefer dreamlike output
  const lower = message.toLowerCase();
  if (lower.includes('dream') || lower.includes('death') || lower.includes('playback')) {
    return `${toneTemplates['dreamlike'][Math.floor(Math.random()*3)]}${playbackHint}`;
  }

  // combine
  return `${base}${playbackHint}`;
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));