import "@testing-library/jest-dom/vitest";

// jsdom has no AudioContext; the timer bell creates one lazily.
if (!window.AudioContext) window.AudioContext = class { createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: { value: 0 } }; } };
