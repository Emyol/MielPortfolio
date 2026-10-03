const { chromium } = require('@playwright/test');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:3109');
  const images = await page.evaluate(async () => {
    await document.fonts.ready;
    const family = getComputedStyle(document.querySelector('.field-brand')).fontFamily;
    await document.fonts.load(`600 256px ${family}`, 'M');
    return [16, 32, 48, 64, 128, 256, 512].map(size => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#070707';
      ctx.fillRect(0, 0, size, size);
      ctx.font = `600 ${size}px ${family}`;
      let bounds = ctx.measureText('M');
      const scale = Math.min(size * .78 / (bounds.actualBoundingBoxLeft + bounds.actualBoundingBoxRight), size * .76 / (bounds.actualBoundingBoxAscent + bounds.actualBoundingBoxDescent));
      ctx.font = `600 ${size * scale}px ${family}`;
      bounds = ctx.measureText('M');
      const x = (size - bounds.actualBoundingBoxLeft - bounds.actualBoundingBoxRight) / 2 + bounds.actualBoundingBoxLeft;
      const y = (size - bounds.actualBoundingBoxAscent - bounds.actualBoundingBoxDescent) / 2 + bounds.actualBoundingBoxAscent;
      ctx.fillStyle = '#ececec';
      ctx.fillText('M', x, y);
      return { size, png: canvas.toDataURL('image/png').split(',')[1] };
    });
  });
  const frames = images.filter(image => image.size <= 256).map(image => ({ size: image.size, data: Buffer.from(image.png, 'base64') }));
  const header = Buffer.alloc(6 + frames.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  let offset = header.length;
  frames.forEach((frame, index) => {
    const entry = 6 + index * 16;
    header[entry] = header[entry + 1] = frame.size === 256 ? 0 : frame.size;
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(frame.data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += frame.data.length;
  });
  fs.writeFileSync('public/favicon.ico', Buffer.concat([header, ...frames.map(frame => frame.data)]));
  fs.writeFileSync('public/favicon.png', Buffer.from(images.at(-1).png, 'base64'));
  console.log('Saved favicon.ico with 16, 32, 48, 64, 128, 256px frames and favicon.png at 512px.');
  await browser.close();
})();
