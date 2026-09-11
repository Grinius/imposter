'use client';
import { create } from 'qrcode';

// Rendered as plain SVG rects from the module matrix, not as an <img> data URL, so it needs no
// innerHTML and works under the site's img-src policy without any exception. The dark modules are
// one path for a small DOM; the quiet zone is the SVG padding.
export default function QrCode({ value, label, size = 152 }: { value: string; label: string; size?: number }) {
  const { modules } = create(value, { errorCorrectionLevel: 'M' });
  const count = modules.size, quiet = 2, total = count + quiet * 2;
  let path = '';
  for (let y = 0; y < count; y++) for (let x = 0; x < count; x++) if (modules.get(y, x)) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
  return <svg className="qr-code" viewBox={`0 0 ${total} ${total}`} width={size} height={size} role="img" aria-label={label} shapeRendering="crispEdges"><rect width={total} height={total} fill="#fffaf0" /><path d={path} fill="#1f3a30" /></svg>;
}
