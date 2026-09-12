import type { Metadata } from 'next';
import Link from 'next/link';
import { Eye, LockKeyhole, Mail } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import BrandWordmark from '@/components/brand';

const title = 'Privacy Policy - Imposter';
const description = 'What Imposter collects when you play or go premium, why, and who to contact about it.';

export const metadata: Metadata = pageMetadata('/privacy/', title, description);

const lastUpdated = '2026-09-12';

export default function PrivacyPage() {
  return <div className="content-page">
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Imposter home"><span className="emblem emblem-small" aria-hidden="true"><Eye strokeWidth={1.25} /></span><BrandWordmark /></Link>
      <span className="header-note">PLAIN LANGUAGE. NO FINE PRINT GAMES.</span>
      <nav aria-label="Main navigation"><Link className="nav-link" href="/">Home</Link></nav>
    </header>
    <main>
      <section className="content-hero">
        <span className="eyebrow"><LockKeyhole size={14} /> PRIVACY POLICY</span>
        <h1>What we collect, and why.</h1>
        <p>Imposter (laughtable.com) doesn&rsquo;t use accounts or passwords. This page explains, in plain language, the little data the game does handle. Last updated {lastUpdated}.</p>
      </section>

      <section className="content-grid" aria-labelledby="privacy-play">
        <h2 id="privacy-play">Playing the game</h2>
        <div>
          <article><span>01</span><h3>Local pass-and-play</h3><p>Player names and settings stay in your browser&rsquo;s memory for that session. Nothing is sent to a server, and nothing is saved once you close or refresh the tab.</p></article>
          <article><span>02</span><h3>Online rooms</h3><p>The names you type and your room code are sent to our server to run the room (Cloudflare Durable Objects) and are only kept for as long as that room stays active, plus a short cleanup window after everyone leaves. We don&rsquo;t link them to a real identity.</p></article>
          <article><span>03</span><h3>Analytics</h3><p>We use Plausible, a cookieless analytics service hosted in the EU, to count page views and a handful of game events (a round started or finished, a room created or joined, an invite shared, a recap saved, and which mode or word pack was used). It sets no cookies, stores no personal identifiers, and needs no consent banner. It never receives player names, secret words, roles, clues, questions or room codes &mdash; the game strips the room code from the page address before it is reported. Plausible&rsquo;s own policy: <a href="https://plausible.io/data-policy">plausible.io/data-policy</a>.</p></article>
          <article><span>04</span><h3>Your browser&rsquo;s local storage</h3><p>Your display name, a random per-device player ID, your last room code, a sound preference, and a premium entitlement token (if you&rsquo;ve paid) are saved only on your own device, not in a profile on our servers. Clearing your browser&rsquo;s site data removes all of it.</p></article>
        </div>
      </section>

      <section className="content-grid" aria-labelledby="privacy-payment">
        <h2 id="privacy-payment">Premium payment</h2>
        <div>
          <article><span>01</span><h3>We never see card details</h3><p>Payment happens entirely on Stripe&rsquo;s own checkout page. We never receive or store your card number, billing address, or other payment details.</p></article>
          <article><span>02</span><h3>What we do receive</h3><p>After a successful payment, Stripe redirects you back with a checkout session ID. We use that ID to confirm the payment directly with Stripe, then store a signed token in your browser proving this device is premium &mdash; no email or account created on our end.</p></article>
          <article><span>03</span><h3>Stripe&rsquo;s own policy applies</h3><p>Stripe collects and processes payment details (including your email, for receipts) under its own privacy policy: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a>.</p></article>
        </div>
      </section>

      <section className="content-grid" aria-labelledby="privacy-other">
        <h2 id="privacy-other">Other things worth knowing</h2>
        <div>
          <article><span>01</span><h3>IP addresses</h3><p>Cloudflare (our hosting provider) and our own abuse-prevention system briefly use your IP address to block spam and rate-limit abuse (like scripted room creation). These counters expire automatically and aren&rsquo;t kept long-term or linked to anything else about you.</p></article>
          <article><span>02</span><h3>No analytics, no ads, no tracking cookies</h3><p>We don&rsquo;t run analytics or advertising scripts, and we don&rsquo;t sell or share your data for marketing. If that changes, this page will say so before it happens.</p></article>
          <article><span>03</span><h3>Third parties we rely on</h3><p>Stripe for payment processing, and Cloudflare for hosting, security, and abuse prevention: <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">cloudflare.com/privacypolicy</a>.</p></article>
          <article><span>04</span><h3>Children</h3><p>Imposter isn&rsquo;t directed at children under 13, and we don&rsquo;t knowingly collect data from them. If you believe a child has given us data, contact us and we&rsquo;ll remove it.</p></article>
          <article><span>05</span><h3>Changes to this policy</h3><p>We may update this page as the game changes. The date at the top always reflects the latest version.</p></article>
        </div>
      </section>

      <section className="content-next"><h2>Questions, or want something removed?</h2><p>Since there&rsquo;s no account system, most of what we hold about you lives only in your own browser and clears when you clear your browser&rsquo;s site data. For anything else &mdash; questions, a data request, or a concern &mdash; reach out directly.</p><div><a className="gold-button" href="mailto:justinas@appcognita.com"><Mail size={17} /> justinas@appcognita.com</a></div></section>
    </main>
  </div>;
}
