// emotionEngine.js
// Very small rule-based emotion detector & tone generator.
// Maps keywords and punctuation patterns to a small set of tones.

const EMOTION_KEYWORDS = {
  sad: ['sad', 'hurt', 'lonely', 'broken', 'cry', 'grief', 'sorrow'],
  angry: ['angry', 'mad', 'furious', 'hate', 'rage'],
  curious: ['why', 'how', 'what if', 'wonder', 'curious'],
  warm: ['love', 'nice', 'happy', 'joy', 'warm', 'glad'],
  dreamlike: ['dream', 'sleep', 'vision', 'beyond', 'afterlife', 'playback']
};

function detectEmotion(text) {
  const lowered = text.toLowerCase();
  let scores = { sad:0, angry:0, curious:0, warm:0, dreamlike:0 };

  for (const [tone, words] of Object.entries(EMOTION_KEYWORDS)) {
    for (const w of words) {
      if (lowered.includes(w)) scores[tone] += 1;
    }
  }

  // punctuation cues
  if (text.includes('?!') || text.includes('!!')) scores.angry += 1;
  if (text.endsWith('?')) scores.curious += 1;
  if (text.includes('...')) scores.dreamlike += 1;

  // pick top
  let tone = 'neutral';
  let best = 0;
  for (const t of Object.keys(scores)) {
    if (scores[t] > best) { best = scores[t]; tone = t; }
  }

  // small mapping to a friendly object
  return {
    tone,
    scores,
    confidence: Math.min(0.99, 0.1 + best * 0.25)
  };
}

function extractFeatures(text) {
  // crude features: length, punctuation density, word variety
  const words = text.trim().split(/\s+/).filter(Boolean);
  const unique = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g,''))).size;
  const punctuation = (text.match(/[.,!?…]/g) || []).length;
  return {
    length: words.length,
    uniqueWords: unique,
    punct: punctuation
  };
}

module.exports = { detectEmotion, extractFeatures };