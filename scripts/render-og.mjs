// Renders the social-preview PNG from its SVG source. Chat apps and social networks (WhatsApp,
// iMessage, Discord, Slack, X, Facebook) do not render an SVG og:image, so the PNG is what gets
// served; the SVG stays the editable source. Run `npm run og` after changing the SVG and commit both.
import sharp from 'sharp';
const source = new URL('../public/og/laughtable-imposter.svg', import.meta.url);
const target = new URL('../public/og/laughtable-imposter.png', import.meta.url);
const info = await sharp(source.pathname, { density: 144 }).resize(1200, 630).png({ compressionLevel: 9, palette: true }).toFile(target.pathname);
console.log(`wrote ${target.pathname} ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
