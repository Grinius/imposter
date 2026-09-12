import type { Metadata } from 'next';
import QuestionImposter from '@/components/variants/question-imposter';
import VariantPage from '@/components/variants/variant-page';
import { questionPairs } from '@/lib/questions';
import { pageMetadata } from '@/lib/seo';

const title = 'Question Imposter Game - Odd Question, Free';
const description = 'Play the Question Imposter game free in your browser: everyone answers the same question except one player who secretly got a different one. Spot the answer that doesn’t fit. 3–5 free players, one phone, no app.';
export const metadata: Metadata = pageMetadata('/question-imposter/', title, description);

export default function QuestionImposterPage() {
  return <VariantPage
    eyebrow="THE ODD-QUESTION IMPOSTER GAME"
    title={<>Question <em>Imposter.</em></>}
    lead="Everyone is asked the same question and answers out loud — except one player, who was secretly asked something slightly different and has no idea. Find the answer that doesn’t fit."
    headerNote="SAME QUESTION. ONE ODD ANSWER."
    game={<QuestionImposter />}
    howTitle="How to play the Question Imposter game"
    howIntro={`No bluffing required. The imposter doesn’t know they’re the imposter, so shy groups and family tables love this one. ${questionPairs.length} question pairs are built in, each pair written so the two answers look alike until you compare them.`}
    steps={[
      { title: 'Add 3–5 free players.', text: 'Use real names so the vote is easy to follow.' },
      { title: 'Reveal your question in private.', text: 'Every card looks identical. Most players get one question; one player gets a different question with the same shape of answer — a number, a name, a food.' },
      { title: 'Answer out loud, one at a time.', text: 'Short, honest answers. Then ask follow-ups: someone’s answer will make perfect sense to them and none at all to everyone else.' },
      { title: 'Vote and reveal.', text: 'Vote privately for the odd one out. The reveal shows both questions side by side. There is no final guess — the imposter had nothing to hide.' },
    ]}
    rulesTitle="The rules, and why it works"
    rules={[
      { term: 'Nobody knows who has the odd question', text: 'Including the player who has it. That’s the whole trick: their answer is honest, so the only tell is that it doesn’t line up.' },
      { term: 'Answers must be short', text: 'A number, a name, a single thing. Long answers give the odd one out room to notice and adjust.' },
      { term: 'Follow-up questions are allowed', text: '“Why that?” is the best tool at the table. The odd one out will explain an answer that was never asked for.' },
      { term: 'Voting', text: 'Private ballots, no self-votes. Most votes is accused; a tie means the odd one out gets away with it, and so does a wrong accusation.' },
      { term: 'Playing to points', text: 'Play five rounds. A correct accusation is a point for every friend; an escape is two points for the odd one out.' },
      { term: 'Write your own', text: 'Any pair works if both questions take the same kind of answer: “How many pets have you had?” and “How many houses have you lived in?”. Keep them the same shape and the game does the rest.' },
    ]}
    faqs={[
      { q: 'How is this different from the word imposter game?', a: 'In the word game the imposter knows they are the imposter and has to bluff. Here nobody bluffs. The imposter is found by comparison, not by acting, which makes it easier for kids, mixed groups, and people who hate lying.' },
      { q: 'Is it the TikTok question imposter game?', a: 'It is the same idea creators film as the “imposter question game” or “odd one out question”: everyone answers, the group works out who got a different question. This version deals the questions privately so nobody sees another card.' },
      { q: 'How many players?', a: 'Three to five play free, and it works well at three. More players unlock with Imposter Premium.' },
      { q: 'Are the questions family-friendly?', a: 'Yes. Every built-in pair is written for mixed tables — nothing that needs an age check.' },
    ]}
    nextTitle="Same table, other secrets"
    nextText="Prefer to bluff? The word game gives one player nothing and makes them talk their way out. Timer Imposter does the same with a stopwatch; Drawing Imposter does it with one line each."
    footerNote="The odd-question imposter game, free."
  />;
}
