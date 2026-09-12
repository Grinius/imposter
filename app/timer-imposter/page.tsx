import type { Metadata } from 'next';
import TimerImposter from '@/components/variants/timer-imposter';
import VariantPage from '@/components/variants/variant-page';
import { pageMetadata } from '@/lib/seo';

const title = 'Timer Imposter Game - Stopwatch Imposter, Free';
const description = 'Play the viral Timer Imposter game free in your browser: everyone sees the target time except the imposter, each player runs a hidden stopwatch, then vote. 3–5 free players, one phone, no app.';
export const metadata: Metadata = pageMetadata('/timer-imposter/', title, description);

export default function TimerImposterPage() {
  return <VariantPage
    eyebrow="THE STOPWATCH IMPOSTER GAME"
    title={<>Timer <em>Imposter.</em></>}
    lead="Everyone is shown the same target time — except one player. Each of you runs a stopwatch you can’t see and stops it when it feels right. Then the table decides who was faking."
    headerNote="ONE TARGET. ONE FAKER. NO NUMBERS."
    game={<TimerImposter />}
    howTitle="How to play the Timer Imposter game"
    howIntro="This is the stopwatch version of the imposter game that took off on TikTok: the same secret-and-bluff structure as the word game, but the secret is a time and the clue is how long you let the clock run. It plays in about four minutes on one phone."
    steps={[
      { title: 'Add 3–5 free players and pick a range.', text: 'Short (3–15 s) is the classic. Quick is savage; Long is a test of nerve.' },
      { title: 'Reveal your card in private.', text: 'Friends see the target, for example 7.40 seconds. The imposter sees only the range and has to guess how long everyone else is aiming for.' },
      { title: 'Run the clock blind, one at a time.', text: 'Put the phone in the middle. Each player taps Start, counts in their head, and taps Stop. No digits appear at any point. The time is recorded silently.' },
      { title: 'Discuss, vote, and reveal.', text: 'Who stopped absurdly early? Who watched the others before pressing? Vote privately. If the imposter is caught, they get one guess at the target to steal the win. Then every time is revealed next to the target.' },
    ]}
    rulesTitle="The rules, and what makes it hard"
    rules={[
      { term: 'The clock stays hidden', text: 'Nobody, including the player running it, sees a number until the reveal. Everyone judges by feel — the length of the pause, the hesitation, the confidence of the tap.' },
      { term: 'One run each', text: 'Each player runs the stopwatch exactly once per round. There is no redo; a slip of the thumb is part of the game.' },
      { term: 'Voting', text: 'Everyone votes privately and cannot vote for themselves. The most-voted player is accused. A tied vote lets the imposter escape.' },
      { term: 'The final guess', text: 'A caught imposter guesses the target. Within a tenth of the target (never tighter than 0.30 s) and they steal the win. Otherwise the friends win.' },
      { term: 'Tip for the imposter', text: 'Go after someone else. Copy their rhythm, then stop a beat later. Going first is the worst seat at the table.' },
      { term: 'Tip for the friends', text: 'Don’t count out loud, don’t mouth numbers, and don’t look at the imposter suspiciously — they’re watching for who reacts.' },
    ]}
    faqs={[
      { q: 'Is this the TikTok timer imposter game?', a: 'Yes. Creators play it with a stopwatch app and a lot of trust; this version hides the clock properly so nobody can peek, records every run, and reveals the times at the end so the argument is settled.' },
      { q: 'Do I need an app or an account?', a: 'No. It runs in the browser on one phone. Nothing is downloaded, nothing is saved, no one signs up.' },
      { q: 'How many players?', a: 'Three to five play free. Bigger tables unlock with Imposter Premium. It is at its best with five or six, when there are enough runs to compare.' },
      { q: 'Can we play it as a drinking game?', a: 'The usual house rules translate directly: a caught imposter drinks, a wrongly accused friend drinks, and the person furthest from the target after the reveal drinks.' },
    ]}
    nextTitle="Same table, other secrets"
    nextText="The word game is the original: one secret word, one-word clues, one liar. Question Imposter and Drawing Imposter change what the secret is without changing the bluff."
    footerNote="The stopwatch imposter game, free."
  />;
}
