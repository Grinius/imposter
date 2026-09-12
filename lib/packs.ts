import { categories, getWords, type Category } from './words';

// Themed packs: each is a category with `group: 'themed'` in lib/words.ts plus the copy for its own
// page under /packs/. The calendar note says when the page is worth pushing; the page itself is
// evergreen. Titles avoid trademarks; the word lists name songs, groups and clubs descriptively.
export interface Pack {
  id: Exclude<Category, 'mixed'>; slug: string; title: string; eyebrow: string; lead: string; when: string;
  pitch: string; pairs: { a: string; b: string; why: string }[]; faqs: { q: string; a: string }[]; keywords: string;
}
export const packs: Pack[] = [
  {
    id: 'halloween', slug: 'halloween', title: 'Halloween Imposter Game', eyebrow: 'THE SPOOKY EDITION',
    lead: 'Forty-eight Halloween words for the imposter game: witches, werewolves, haunted houses and everything that goes bump at a party. One phone, no app, free.',
    when: 'Post from mid-October; peaks the week of 31 October.',
    pitch: 'Halloween words are perfect imposter material because so many of them come in pairs that share clues. "Fangs" fits a vampire and a werewolf; "night" fits almost everything. The imposter has cover; the friends have to be specific without saying "coffin".',
    pairs: [
      { a: 'Vampire', b: 'Werewolf', why: '“Fangs”, “night” and “bite” fit both. “Garlic” or “silver” gives it away.' },
      { a: 'Ghost', b: 'Zombie', why: 'Both are undead and both say “boo”-adjacent things. “Brains” or “sheet” ends it.' },
      { a: 'Witch', b: 'Fortune teller', why: '“Crystal ball” and “cauldron” separate them; “spooky” doesn’t.' },
      { a: 'Pumpkin', b: 'Jack-o’-lantern', why: 'The imposter’s dream: nearly every clue for one works for the other.' },
    ],
    faqs: [
      { q: 'Is the Halloween pack free?', a: 'Yes. Every themed pack is free; the paid tier is bigger tables and custom packs.' },
      { q: 'Is it kid-friendly?', a: 'It is spooky, not gory: “fake blood” and “chainsaw” are the edgiest entries. Skip a word out loud if your table is very young.' },
      { q: 'Can we draw these instead?', a: 'Yes — the Halloween pack is available in Drawing Imposter, where “Skeleton” and “Haunted house” make excellent one-line-at-a-time subjects.' },
    ],
    keywords: 'halloween imposter game words',
  },
  {
    id: 'football', slug: 'football', title: 'Football Imposter Game', eyebrow: 'THE MATCHDAY EDITION',
    lead: 'Forty-eight football words for the imposter game — positions, moments, competitions and terrace culture. Built for the pub, the away coach, and the group chat that never stops arguing.',
    when: 'Evergreen; spikes around derby weekends, cup finals and the summer tournament.',
    pitch: 'Football is full of near-synonyms, which is exactly what the imposter needs. A “free kick” and a “penalty” share “referee”, “whistle” and “wall”. The friends win by knowing the one word that only fits one of them.',
    pairs: [
      { a: 'Penalty', b: 'Free kick', why: '“Whistle”, “foul” and “keeper” fit both. “Spot” or “twelve yards” does not.' },
      { a: 'Red card', b: 'Yellow card', why: 'Same pocket, same referee. “Early bath” or “booking” separates them.' },
      { a: 'Champions League', b: 'World Cup', why: '“Trophy”, “final”, “anthem”. Only one has “Tuesday nights”.' },
      { a: 'Header', b: 'Volley', why: 'Both are “technique” and “cross” clues; “forehead” is a giveaway.' },
    ],
    faqs: [
      { q: 'Is this football or American football?', a: 'Association football — the world game. The words are positions, rules, competitions and fan culture, not club or player names, so nobody at the table has a home advantage.' },
      { q: 'Does it work with people who don’t follow football?', a: 'Mostly. The rules words (“offside”, “corner kick”) are common knowledge; the deeper cuts (“nutmeg”, “Ballon d’Or”) reward the fans. Mix the table and the fans will be suspected of being imposters for knowing too much.' },
      { q: 'Can I add my club?', a: 'Custom packs are coming to Premium. Until then, play a round and then argue about whose club should be a word.' },
    ],
    keywords: 'football imposter game',
  },
  {
    id: 'k-pop', slug: 'k-pop', title: 'K-pop Imposter Game', eyebrow: 'THE COMEBACK EDITION',
    lead: 'Forty-eight K-pop words for the imposter game: fandom vocabulary, group roles, stage moments and the groups themselves. Made for the friends who know every fan chant.',
    when: 'Evergreen; post on comeback weeks and around year-end award shows.',
    pitch: 'K-pop has its own dictionary, and that is the whole game here. A “bias” and a “bias wrecker” share nearly every clue. “Lightstick” and “lightstick ocean” are one word apart. Non-fans at the table become instant suspects, which is half the fun.',
    pairs: [
      { a: 'Bias', b: 'Bias wrecker', why: 'Both are “favourite” and “member”. “Second” or “stealing” separates them.' },
      { a: 'Comeback', b: 'Debut', why: '“Album”, “teaser”, “music show” all fit. “First” ends it.' },
      { a: 'Maknae', b: 'Leader', why: 'Both are group roles; “youngest” vs “speech” tells them apart.' },
      { a: 'Fan chant', b: 'Encore', why: 'Both happen at a concert and both involve the crowd.' },
    ],
    faqs: [
      { q: 'Do I need to know K-pop to play?', a: 'The friends should; the imposter doesn’t, which is why this pack is at its best when one person at the table genuinely has no idea — they are usually not the imposter, and they get accused anyway.' },
      { q: 'Which groups are in the pack?', a: 'Fourteen of the biggest current and classic groups, alongside the fandom vocabulary. Group names are used descriptively; this game is not affiliated with any of them.' },
      { q: 'Is the pack free?', a: 'Yes, every themed pack is.' },
    ],
    keywords: 'kpop imposter game',
  },
  {
    id: 'pop-superstars', slug: 'pop-superstars', title: 'Pop Superstars Imposter Game', eyebrow: 'THE ERAS EDITION',
    lead: 'Forty-eight pop words for the imposter game: the hits, albums, eras and stars everyone at the table has argued about. Swiftie-approved, but the whole pop canon is in here.',
    when: 'Evergreen; post on album-release weeks, tour dates and award nights.',
    pitch: 'Song titles are the trickiest imposter words there are, because the obvious clue is the artist and the artist fits ten other words in the pack. “Cruel Summer” and “Anti-Hero” share “Taylor”; the friends need “August” or “problem” instead.',
    pairs: [
      { a: 'Cruel Summer', b: 'Anti-Hero', why: 'Same artist, same tour. “Problem” or “August” separates them.' },
      { a: 'Espresso', b: 'Flowers', why: 'Both were the song of a summer; “coffee” vs “buy” gives it away.' },
      { a: 'Bad Guy', b: 'Bad Romance', why: 'The imposter hears “bad” and relaxes. “Duh” or “Gaga” ends it.' },
      { a: 'Beyoncé', b: 'Rihanna', why: 'Both are one-name superstars; “Renaissance” vs “umbrella” tells.' },
    ],
    faqs: [
      { q: 'Is this a Taylor Swift imposter game?', a: 'Partly. Her biggest songs, albums and the Eras Tour are in the pack, next to the rest of the pop canon — so a table of Swifties and a table of everyone else both get a fair round.' },
      { q: 'Are these official?', a: 'No. Song, album and artist names are used descriptively in a word list; the game is not affiliated with any artist or label.' },
      { q: 'Can we play this online?', a: 'Yes, every pack is available in online rooms too — pick it in the lobby.' },
    ],
    keywords: 'taylor swift imposter game',
  },
  {
    id: 'christmas', slug: 'christmas', title: 'Christmas Imposter Game', eyebrow: 'THE FESTIVE EDITION',
    lead: 'Forty-eight Christmas words for the imposter game — the tree, the dinner, the films and the arguments. The after-dinner game for a full table, on the one phone that still has battery.',
    when: 'Post from late November; peaks 24–26 December and again at New Year gatherings.',
    pitch: 'Christmas is a pack of pairs: “Mince pie” and “Christmas pudding”, “Elf” and “Reindeer”, “Tinsel” and “Fairy lights”. Everybody at the table knows all of them, which makes the vague clue — “festive”, “December” — the imposter’s best friend and everyone else’s tell.',
    pairs: [
      { a: 'Mince pie', b: 'Christmas pudding', why: '“Dessert”, “brandy” and “dried fruit” fit both. “Pastry” or “flames” does not.' },
      { a: 'Elf', b: 'Reindeer', why: 'Both work for Santa; “ears” vs “antlers”.' },
      { a: 'Tinsel', b: 'Fairy lights', why: 'Both go on the tree and both are “sparkly”. “Plug” ends it.' },
      { a: 'Home Alone', b: 'The Grinch', why: 'Both are Christmas films; “burglars” vs “green”.' },
    ],
    faqs: [
      { q: 'Is it good for mixed ages?', a: 'It is the best pack for a family table: every word is something a seven-year-old and a grandparent both know, so the vote is about who sounded vague, not who knew the most.' },
      { q: 'How many players?', a: 'Three to five play free; a Christmas table of ten or twelve unlocks with Imposter Premium.' },
      { q: 'Can we play it as a drinking game?', a: 'The usual house rules: a caught imposter drinks, a wrongly accused friend drinks, and anyone who says the word out loud drinks twice.' },
    ],
    keywords: 'christmas imposter game words',
  },
];
export function packBySlug(slug: string) { return packs.find(pack => pack.slug === slug) ?? null; }
export function packWords(pack: Pack) { return getWords(pack.id); }
export function packCategory(pack: Pack) { return categories.find(category => category.id === pack.id)!; }
// `/?pack=halloween` (and the generator's equivalent) preselects a category; anything else is ignored.
export function categoryFromSearch(search: string): Category | null {
  const value = new URLSearchParams(search).get('pack');
  return value && categories.some(category => category.id === value) ? value as Category : null;
}
