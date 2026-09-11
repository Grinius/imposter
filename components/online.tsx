'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Clock3, Copy, Link2, LockKeyhole, Radio, Share2, Users, Wifi, X } from 'lucide-react';
import { inviteUrl, invitePath, roomIdFromSearch, type PrivateRole, type PublicRoom } from '@/lib/online';
import QrCode from '@/components/qr-code';
import { siteHost } from '@/components/brand';
import type { Settings } from '@/lib/game';
import { categories, type Category } from '@/lib/words';
import UpgradeCard from '@/components/premium/upgrade-card';
import PremiumPaywallNotice from '@/components/premium/paywall-notice';
import { premiumFeatures } from '@/lib/premium';
import { freePlayerLimit, minPlayerLimit, premiumPlayerLimit } from '@/lib/limits';
import { getStoredPremiumToken, usePremiumStatus } from '@/lib/premium-client';
import BrandWordmark from '@/components/brand';

const expectedPlayerOptions = [3, 4, 5, 6, 7, 8, 10, 12, 15, 20];
type SocketMessage = { type: 'room'; room: PublicRoom } | { type: 'seat'; playerId: string; seat: string } | { type: 'role'; role: PrivateRole } | { type: 'error'; message: string };

// A seat is issued by the server, per room, and is the credential that reclaims that seat after a
// refresh or a dropped connection. It is deliberately not generated here: a player id the client
// picked (or one read off the public room list) must never be enough to claim someone's seat.
type Seat = { playerId: string; seat: string };
const seatKey = (code: string) => `imposter-seat-${code}`;
function readSeat(code: string): Seat | null {
  try { const stored = window.localStorage.getItem(seatKey(code)); return stored ? JSON.parse(stored) as Seat : null; } catch { return null; }
}
export default function OnlineGame() {
  const [name, setName] = useState(() => typeof window !== 'undefined' ? window.localStorage.getItem('imposter-player-name') ?? 'Alex' : 'Alex'), [invitedCode, setInvitedCode] = useState(() => typeof window !== 'undefined' ? roomIdFromSearch(window.location.search) : null), [roomCode, setRoomCode] = useState(() => typeof window !== 'undefined' ? roomIdFromSearch(window.location.search) ?? window.localStorage.getItem('imposter-room-code') ?? '' : ''), [room, setRoom] = useState<PublicRoom | null>(null), [role, setRole] = useState<PrivateRole | null>(null), [error, setError] = useState(''), [copied, setCopied] = useState(false), [clue, setClue] = useState(''), [guess, setGuess] = useState(''), [myPlayerId, setMyPlayerId] = useState('');
  const [category, setCategory] = useState<Category>('mixed'), [minutes, setMinutes] = useState(3), [hints, setHints] = useState(true), [paywallReasons, setPaywallReasons] = useState<string[] | null>(null);
  const [expectedPlayers, setExpectedPlayers] = useState(freePlayerLimit);
  const [canShare] = useState(() => typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  const { premium } = usePremiumStatus();
  const socket = useRef<WebSocket | null>(null), audio = useRef<AudioContext | null>(null), leaving = useRef(false);
  useEffect(() => {
    // A code in the URL is an invite: it wins over whatever room this browser last sat in. A guest
    // who already holds a seat there (they refreshed, or tapped the link twice) goes straight back
    // in; anyone else sees the join form with the code filled so all that's left is a name.
    const savedCode = window.localStorage.getItem('imposter-room-code');
    if (invitedCode) { if (readSeat(invitedCode)) connect(invitedCode, readSeat(invitedCode)); }
    else if (savedCode) connect(savedCode, readSeat(savedCode));
    return () => socket.current?.close();
  }, []);
  // Keep the address bar equal to the invite while in a room, so the URL itself is shareable and a
  // refresh reconnects to the same room, and put it back once the player leaves.
  useEffect(() => {
    const target = room ? inviteUrl(window.location.origin, room.roomId) : window.location.origin + invitePath;
    if (window.location.href !== target) window.history.replaceState(null, '', target);
  }, [room]);
  function connect(code: string, credentials: Seat | null = null, create = false) {
    leaving.current = false;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const connection = new WebSocket(`${protocol}//${window.location.host}/api/rooms/${code}`);
    socket.current = connection;
    (window as Window & { __imposterSocket?: WebSocket }).__imposterSocket = connection;
    connection.onopen = () => connection.send(JSON.stringify({ type: 'join', name, playerId: credentials?.playerId, seat: credentials?.seat, premiumToken: getStoredPremiumToken() ?? undefined, create }));
    connection.onmessage = event => {
      const message = JSON.parse(event.data) as SocketMessage;
      // The seat message is this socket's alone. Only the public player id reaches render state;
      // the secret goes straight to storage so nothing can read it back out of the DOM.
      if (message.type === 'seat') { setMyPlayerId(message.playerId); try { window.localStorage.setItem(seatKey(code), JSON.stringify({ playerId: message.playerId, seat: message.seat })); } catch { /* private mode: the seat just will not survive a refresh */ } }
      if (message.type === 'room') setRoom(message.room);
      if (message.type === 'role') setRole(message.role);
      if (message.type === 'error') setError(message.message);
    };
    connection.onclose = () => { if (leaving.current) return; setError('The room connection closed. Refresh to reconnect.'); };
  }
  // The seat deliberately survives leaving: the server keeps an empty seat in the room either way,
  // so holding on to the credential means coming back re-takes that seat instead of adding a second
  // one and eating a slot in a five-player room.
  function leaveRoom() { leaving.current = true; socket.current?.close(); socket.current = null; window.localStorage.removeItem('imposter-room-code'); setRoom(null); setRole(null); setError(''); setRoomCode(''); setInvitedCode(null); setClue(''); setGuess(''); setMyPlayerId(''); }
  async function create() { setError(''); const response = await fetch('/api/rooms', { method: 'POST' }); if (!response.ok) { setError('Could not create a room yet.'); return; } const data = await response.json() as { roomId: string }; window.localStorage.setItem('imposter-room-code', data.roomId); window.localStorage.setItem('imposter-player-name', name); setRoomCode(data.roomId); connect(data.roomId, null, true); }
  function join() { const code = roomCode.trim().toUpperCase(); if (!/^[A-Z0-9]{6}$/.test(code)) { setError('Enter the six-character room code.'); return; } setError(''); window.localStorage.setItem('imposter-room-code', code); window.localStorage.setItem('imposter-player-name', name); connect(code, readSeat(code)); }
  function invite() { return room ? inviteUrl(window.location.origin, room.roomId) : ''; }
  async function copyInvite() { try { await navigator.clipboard.writeText(invite()); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setError('Could not copy. The link is in your address bar.'); } }
  // Native share where it exists (phones), the clipboard everywhere else; a dismissed share sheet is
  // not an error.
  async function shareInvite() { if (!canShare) return copyInvite(); try { await navigator.share({ title: 'Join my Imposter room', text: `Join my Imposter game on ${siteHost} — room ${room?.roomId}`, url: invite() }); } catch (cause) { if (!(cause instanceof DOMException && cause.name === 'AbortError')) await copyInvite(); } }
  function start() {
    if (!room) return;
    const chosen = categories.find(item => item.id === category);
    if (chosen?.premium && !room.premium) { setPaywallReasons([`${chosen.name} category`]); setError(''); return; }
    setPaywallReasons(null);
    const settings: Settings = { names: room.players.map(player => player.name), category, minutes, hints };
    socket.current?.send(JSON.stringify({ type: 'start', settings }));
  }
  function chime() { try { const context = audio.current ?? new AudioContext(); audio.current = context; const oscillator = context.createOscillator(), gain = context.createGain(); oscillator.connect(gain); gain.connect(context.destination); oscillator.frequency.value = 620; gain.gain.setValueAtTime(.025, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .18); oscillator.start(); oscillator.stop(context.currentTime + .2); } catch { /* audio is optional */ } }
  function act(action: object) { if (room) socket.current?.send(JSON.stringify({ type: 'action', round: room.round, action })); }
  const game = room?.game;
  const phaseKey = game ? `${game.phase}-${game.cursor}-${game.votesSubmitted}` : '';
  const previousPhase = useRef('');
  useEffect(() => { if (phaseKey && previousPhase.current && phaseKey !== previousPhase.current) chime(); previousPhase.current = phaseKey; }, [phaseKey]);
  function gamePanel() {
    if (!room || !game || (room.status !== 'playing' && game.phase !== 'result')) return null;
    // The server rejects a clue or a ballot from anyone but the player the cursor is on, so this is
    // the matching UI: a player is never shown a control whose only outcome would be an error, and
    // nobody can accidentally speak or vote in someone else's name.
    const myTurn = !!myPlayerId && game.cursorPlayerId === myPlayerId;
    const cursorName = room.players[game.cursor]?.name ?? 'the next player';
    const cluesDone = game.clues.length >= game.playerCount;
    if (game.phase === 'discussion') return <div className="online-game-panel">
      <h2>Discuss the clues</h2>
      <div className="clue-list">{game.clues.map((item, index) => <p key={`${index}-${item}`}><b>{room.players[(game.firstClue + index) % room.players.length]?.name}:</b> {item}</p>)}</div>
      {cluesDone ? <p className="online-note">Everyone has given a clue.</p>
        : myTurn ? <form onSubmit={event => { event.preventDefault(); if (clue.trim()) { act({ type: 'clue', text: clue }); setClue(''); } }}><input value={clue} onChange={event => setClue(event.target.value)} maxLength={120} placeholder="Your clue" /><button className="gold-button" type="submit">Submit clue</button></form>
          : <p className="online-note">Waiting for {cursorName}&rsquo;s clue…</p>}
      {room.hostId === myPlayerId && cluesDone && <button className="gold-button" onClick={() => act({ type: 'start-vote' })}>Start voting</button>}
    </div>;
    if (game.phase === 'vote-handoff' || game.phase === 'voting') return <div className="online-game-panel">
      <h2>{myTurn ? (game.phase === 'voting' ? 'Cast your vote' : 'Your ballot is ready') : 'Voting in progress'}</h2>
      <p>{myTurn ? (game.phase === 'voting' ? 'Who is the imposter?' : 'Open your ballot when nobody is looking over your shoulder.') : `Waiting for ${cursorName} to vote…`}</p>
      {myTurn && game.phase === 'vote-handoff' && <button className="gold-button" onClick={() => act({ type: 'open-ballot' })}>Open my ballot</button>}
      {myTurn && game.phase === 'voting' && <div className="vote-grid">{room.players.map((player, index) => index === game.cursor ? null : <button key={player.id} className="outline-button" onClick={() => act({ type: 'vote', target: index })}>{player.name}</button>)}</div>}
      <p className="online-note">{game.votesSubmitted} of {game.playerCount} votes submitted.</p>
    </div>;
    if (game.phase === 'guess') return <div className="online-game-panel">
      <h2>The imposter was caught</h2>
      {role?.role === 'imposter'
        ? <form onSubmit={event => { event.preventDefault(); act({ type: 'guess', word: guess }); }}><input value={guess} onChange={event => setGuess(event.target.value)} placeholder="Guess the secret word" /><button className="gold-button" type="submit">Make final guess</button></form>
        : <p>Waiting for the imposter to make a final guess…</p>}
    </div>;
    if (game.phase === 'result') return <div className="online-game-panel">
      <h2>{game.winner === 'friends' ? 'Friends win!' : 'The imposter wins.'}</h2>
      <p>Reason: {game.reason}.</p>
      <p className="result-brand">Played on <b>{siteHost}</b></p>
      {room.hostId === myPlayerId && <button className="gold-button" onClick={start}>Play another round</button>}
    </div>;
    return <div className="online-game-panel"><p>Waiting for {cursorName}…</p></div>;
  }
  return <main className="online-page"><header className="site-header"><Link className="brand" href="/"><span className="emblem emblem-small"><span>◉</span></span><BrandWordmark /></Link><span className="header-note">PRIVATE ROOMS. PUBLIC SUSPICIONS.</span><Link className="nav-link" href="/"><ArrowLeft size={16} /> Pass &amp; play</Link></header><section className="online-card"><div className="eyebrow"><Radio size={14} /> ONLINE EDITION · BETA</div><h1>Same bluff.<br /><em>Different rooms.</em></h1><p className="online-lead">Play Imposter with friends wherever they are. Create a private room, share the code, and keep your secrets to yourself.</p>{!room ? <div className="online-entry">{(() => {
            // An invited guest gets the join form first and the create form under the rule; anyone
            // arriving without a code sees them the other way round.
            const nameField = <label>Your name<input value={name} maxLength={20} onChange={event => setName(event.target.value)} placeholder="Enter your name" /></label>;
            const createBlock = <><label>Expecting how many players?<select value={expectedPlayers} onChange={event => setExpectedPlayers(Number(event.target.value))}>{expectedPlayerOptions.map(count => <option key={count} value={count}>{count} players</option>)}</select></label>{expectedPlayers > freePlayerLimit && !premium && <PremiumPaywallNotice reasons={[`${expectedPlayers} players (free rooms support up to ${freePlayerLimit} — this is just a heads-up, anyone can still join up to that many)`]} onUseFree={() => setExpectedPlayers(freePlayerLimit)} />}<button className={invitedCode ? 'outline-button' : 'gold-button'} onClick={create} disabled={!name.trim()}><Users size={18} /> Create a private room<ArrowRight size={17} /></button></>;
            const joinBlock = <>{invitedCode && <p className="invite-note"><Link2 size={14} /><span>You&rsquo;ve been invited to room <b>{invitedCode}</b>. Add your name and join.</span></p>}<label>Room code<input value={roomCode} maxLength={6} onChange={event => setRoomCode(event.target.value.toUpperCase())} placeholder="ABC123" /></label>{invitedCode && nameField}<button className={invitedCode ? 'gold-button' : 'outline-button'} onClick={join} disabled={!name.trim()}><Link2 size={17} /> {invitedCode ? `Join room ${invitedCode}` : 'Join with code'}</button></>;
            return invitedCode
              ? <>{joinBlock}<div className="or-rule"><span>OR START YOUR OWN ROOM</span></div>{createBlock}</>
              : <>{nameField}{createBlock}<div className="or-rule"><span>OR JOIN A ROOM</span></div>{joinBlock}</>;
          })()}{error && <p role="alert" className="form-error">{error}</p>}</div> : <div className="room-lobby"><div className="room-code"><span>ROOM CODE</span><strong>{room.roomId}</strong><div className="invite-actions"><button onClick={shareInvite} aria-label="Share room invite link">{canShare ? <Share2 size={17} /> : <Copy size={17} />}{canShare ? 'Share invite' : copied ? 'Copied' : 'Copy invite link'}</button>{canShare && <button onClick={copyInvite} aria-label="Copy room invite link">{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'Copied' : 'Copy link'}</button>}</div></div>{room.status === 'lobby' && <div className="invite-qr"><QrCode value={inviteUrl(window.location.origin, room.roomId)} label={`QR code that opens the invite link for room ${room.roomId}`} /><span>Scan to join · <b>{siteHost}</b></span></div>}<div className="lobby-status"><span className="live-dot" /> Waiting for your friends <b>{room.players.length} / {room.premium ? premiumPlayerLimit : freePlayerLimit}</b></div><div className="online-players">{room.players.map(player => <div key={player.id} className="online-player"><span className={`presence ${player.connected ? 'connected' : ''}`} /><span>{player.name}</span>{player.isHost && <small>HOST</small>}</div>)}</div><div className="online-premium-locks"><UpgradeCard feature={premiumFeatures.find(feature => feature.id === 'branded-rooms')} compact unlocked={room.premium} /><UpgradeCard feature={premiumFeatures.find(feature => feature.id === 'room-history')} compact unlocked={room.premium} /></div>{role && <div className="online-role"><LockKeyhole size={17} /><span>You are the <strong>{role.role === 'imposter' ? 'imposter' : 'friend'}</strong>{role.word ? ` · Secret word: ${role.word}` : role.hint ? ` · Hint: ${role.hint}` : ''}</span></div>}{room.status === 'lobby' && room.hostId === myPlayerId && <>
            <div className="field-heading category-heading"><label id="online-category-label">Secret category</label></div>
            <div className="category-grid" role="group" aria-labelledby="online-category-label">{categories.map(item => { const locked = item.premium && !room.premium; return <button type="button" key={item.id} className={`category-button ${category === item.id ? 'selected' : ''} ${locked ? 'premium-slot' : ''}`} aria-pressed={category === item.id} onClick={() => { setCategory(item.id); setPaywallReasons(null); }}><span>{item.short}</span>{locked && <small className="premium-tag"><LockKeyhole size={10} /> Premium</small>}{category === item.id && <Check size={11} className="category-check" />}</button>; })}</div>
            <div className="game-options"><label className="time-option"><Clock3 size={16} /><span>Discussion</span><select aria-label="Discussion duration" value={minutes} onChange={event => setMinutes(Number(event.target.value))}><option value={2}>2 min</option><option value={3}>3 min</option><option value={5}>5 min</option></select><ChevronDown size={12} /></label><label className="hint-option"><span>Imposter hint</span><input type="checkbox" checked={hints} onChange={event => setHints(event.target.checked)} /><span className="switch" aria-hidden="true" /></label></div>
            {paywallReasons && <PremiumPaywallNotice reasons={paywallReasons} onUseFree={() => { setCategory('mixed'); setPaywallReasons(null); }} />}
            <button className="gold-button" disabled={room.players.length < minPlayerLimit} onClick={start}><Wifi size={18} /> Start the round<ArrowRight size={17} /></button>
          </>}{gamePanel()}<button className="outline-button" onClick={leaveRoom}><X size={17} /> Leave room</button>{error && <p role="alert" className="form-error">{error}</p>}</div>}<p className="online-note"><LockKeyhole size={13} /> Private by room code. No account required.</p></section><section className="online-explainer"><div><span>01</span><strong>Create a room</strong><p>Choose a name and get a private six-character code.</p></div><div><span>02</span><strong>Invite your friends</strong><p>Send the link or code to everyone joining remotely.</p></div><div><span>03</span><strong>Keep your secret</strong><p>Each player receives only their own role and word.</p></div></section></main>;
}
