// dnaEngine.js
// Simulates encoding sensory-like traces into a "geneMemory" store per session.
// This is a simple, deterministic simulation to show the concept.

const store = {}; // sessionId -> { geneMemory: [], patterns: [] }

function ensure(sessionId) {
  if (!store[sessionId]) store[sessionId] = { geneMemory: [], patterns: [] };
  return store[sessionId];
}

module.exports = {
  record(sessionId, sensory) {
    const s = ensure(sessionId);
    // store a compact sensory snapshot (simulate encoding into "DNA")
    s.geneMemory.push({
      id: s.geneMemory.length,
      text: sensory.text,
      features: sensory.features,
      t: sensory.time
    });
    // keep memory manageable
    if (s.geneMemory.length > 200) s.geneMemory.shift();
  },

  playback(sessionId, opts = {}) {
    const s = ensure(sessionId);
    // default: return last N experiences, optionally reversed (so "backwards" playback)
    const n = opts.length || 5;
    const entries = s.geneMemory.slice(-n);
    if (opts.reverse) entries.reverse();
    return entries;
  },

  update(sessionId, pattern) {
    const s = ensure(sessionId);
    // extract simple patterns: most common words, tones, lengths
    s.patterns.push({
      at: pattern.time,
      tone: pattern.emotion && pattern.emotion.tone,
      preview: (pattern.reply || '').slice(0,80)
    });
    if (s.patterns.length > 100) s.patterns.shift();
  },

  analyze(sessionId) {
    const s = ensure(sessionId);
    // small analysis: counts
    return {
      memoryCount: s.geneMemory.length,
      patterns: s.patterns.slice(-10)
    };
  },

  // for debugging / tests
  _dump() { return store; }
};