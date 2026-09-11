// The wordmark stays "imposter." (the game) and the site name rides underneath it, so the name a
// player needs to type later is on every screen without redrawing the header. Used by every page
// header; the footer and result screens name the domain outright.
export const siteName = 'LaughTable';
export const siteHost = 'laughtable.com';
export default function BrandWordmark() {
  return <span className="brand-words"><span>imposter<span className="brand-dot">.</span></span><small className="brand-site">by {siteName}</small></span>;
}
