import type { Metadata } from 'next';
import DrawingImposter from '@/components/variants/drawing-imposter';
import VariantPage from '@/components/variants/variant-page';
import { pageMetadata } from '@/lib/seo';

const title = 'Drawing Imposter Game - Fake Artist, Free';
const description = 'Play the Drawing Imposter game free in your browser: everyone adds one line to the same drawing, but one player doesn’t know what it is. Vote out the fake artist. 3–5 free players, one phone, no app.';
export const metadata: Metadata = pageMetadata('/drawing-imposter/', title, description);

export default function DrawingImposterPage() {
  return <VariantPage
    eyebrow="THE FAKE ARTIST IMPOSTER GAME"
    title={<>Drawing <em>Imposter.</em></>}
    lead="Everyone knows what the picture is meant to be, except one player. Pass the phone and each add a single line. Too vague and you look like the imposter; too clear and you hand them the answer."
    headerNote="ONE PICTURE. ONE FAKE ARTIST."
    game={<DrawingImposter />}
    howTitle="How to play the Drawing Imposter game"
    howIntro="This is the imposter game as a group drawing: the same secret word as the classic, but the clue is a line on a shared canvas instead of a spoken word. Each line is coloured by the player who drew it, so the table can argue about exactly which squiggle gave the game away."
    steps={[
      { title: 'Add 3–5 free players and choose a category.', text: 'Animals and food are the easiest to draw. Mixed keeps everyone guessing.' },
      { title: 'Reveal your card in private.', text: 'Friends see the word — say, “Penguin”. The imposter sees only the category and has to bluff a line that fits.' },
      { title: 'Pass the phone and draw one line each.', text: 'One continuous stroke per turn, from finger down to finger up. You can redo once if you slip. Two passes round the table by default.' },
      { title: 'Discuss, vote, and reveal.', text: 'Whose line added nothing? Who copied the last one? Vote privately. A caught imposter gets one guess at the word to steal the win.' },
    ]}
    rulesTitle="The rules, and how to draw like you know"
    rules={[
      { term: 'One continuous line', text: 'Lifting your finger ends the turn. A dot counts. A line that wanders the whole canvas is legal but suspicious.' },
      { term: 'Lines are colour-coded', text: 'Every stroke keeps the colour of the player who drew it, so the reveal shows exactly who contributed what.' },
      { term: 'Two passes', text: 'The first pass is safe: everyone draws something vague. The second pass is where the imposter has to commit — or gets caught adding a leg to a teapot.' },
      { term: 'Voting and the final guess', text: 'Private ballots, no self-votes, a tie is an escape. A caught imposter names the drawing to steal the win; spelling doesn’t matter, the word does.' },
      { term: 'Tip for the friends', text: 'Draw the part that proves you know it, not the part that explains it. A penguin’s belly, not its whole outline.' },
      { term: 'Tip for the imposter', text: 'Extend someone else’s line. Adding to what’s there looks like knowledge; starting something new looks like a guess.' },
    ]}
    faqs={[
      { q: 'Is this the same as A Fake Artist Goes to New York?', a: 'It’s the same family of game — a hidden fake artist in a shared drawing — played with a secret word on one phone instead of cards and pens. The rules here are our own house version.' },
      { q: 'Do I need a stylus?', a: 'No. A finger on a phone works; so does a mouse or trackpad on a laptop. The canvas locks page scrolling while you draw.' },
      { q: 'Does the drawing get saved?', a: 'Only for the round. Nothing leaves the phone and nothing is uploaded.' },
      { q: 'How many players?', a: 'Three to five play free; five or six is the sweet spot for two passes. Bigger tables unlock with Imposter Premium.' },
    ]}
    nextTitle="Same table, other secrets"
    nextText="The word game is the original one-word-clue version. Timer Imposter replaces the word with a target time; Question Imposter finds the odd one out with no bluffing at all."
    footerNote="The fake artist imposter game, free."
  />;
}
