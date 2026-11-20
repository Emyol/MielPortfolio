// Draws the ocean off the main thread. The engine transfers the page's canvas here and then sends the page state
// for each frame; after drawing a frame the worker answers 'drawn' so the engine never queues more than one.
import { createOcean } from './ocean-core';

let ocean = null;
self.onmessage = (e) => {
  const { type, args, canvas } = e.data;
  if (type === 'init') { ocean = createOcean(canvas, (w, h) => new OffscreenCanvas(w, h)); return; }
  if (!ocean) return;
  ocean[type](...args);
  if (type === 'frame') self.postMessage('drawn');
};
