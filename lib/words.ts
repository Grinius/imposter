export const categories = [
  { id: 'mixed', name: 'A little of everything', short: 'Mixed bag', hint: 'A surprise from every category', premium: false },
  { id: 'food', name: 'Food & drink', short: 'Food & drink', hint: 'Something delicious', premium: false },
  { id: 'animals', name: 'Animal kingdom', short: 'Animals', hint: 'Something in the animal kingdom', premium: false },
  { id: 'places', name: 'Out & about', short: 'Places', hint: 'Somewhere you can go', premium: true },
  { id: 'objects', name: 'Everyday things', short: 'Objects', hint: 'An object you might recognize', premium: true },
  { id: 'activities', name: 'Things we do', short: 'Activities', hint: 'Something people do', premium: true },
  { id: 'date-night', name: 'Date night', short: 'Date night', hint: 'Something for a romantic evening', premium: true },
  { id: 'holidays', name: 'Holidays & celebrations', short: 'Holidays', hint: 'Something festive', premium: true },
] as const;
export type Category = typeof categories[number]['id'];
export interface Word { id: string; text: string; category: Exclude<Category, 'mixed'>; }
const packs: Record<Exclude<Category, 'mixed'>, string[]> = {
  food: ['Pizza', 'Popcorn', 'Chocolate', 'Sushi', 'Pancake', 'Watermelon', 'Ice cream', 'Spaghetti', 'Croissant', 'Lemonade', 'Taco', 'Cheese', 'Honey', 'Pretzel', 'Pineapple', 'Doughnut', 'Coffee', 'Avocado', 'Waffle', 'Cookie', 'Soup', 'Grapes', 'Sandwich', 'Cereal'],
  animals: ['Penguin', 'Elephant', 'Octopus', 'Giraffe', 'Butterfly', 'Dolphin', 'Kangaroo', 'Flamingo', 'Hedgehog', 'Chameleon', 'Jellyfish', 'Panda', 'Owl', 'Crocodile', 'Squirrel', 'Peacock', 'Turtle', 'Seahorse', 'Camel', 'Bee', 'Fox', 'Rabbit', 'Snail', 'Bat'],
  places: ['Library', 'Airport', 'Beach', 'Museum', 'Cinema', 'Supermarket', 'Lighthouse', 'Castle', 'Aquarium', 'Bakery', 'Playground', 'Train station', 'Desert', 'Waterfall', 'Campsite', 'Stadium', 'Treehouse', 'Restaurant', 'Mountain', 'Zoo', 'Garden', 'Swimming pool', 'Farm', 'Island'],
  objects: ['Umbrella', 'Telescope', 'Toothbrush', 'Backpack', 'Candle', 'Scissors', 'Guitar', 'Mirror', 'Headphones', 'Compass', 'Camera', 'Ladder', 'Bicycle', 'Pillow', 'Kite', 'Suitcase', 'Key', 'Clock', 'Sunglasses', 'Balloon', 'Book', 'Magnet', 'Paintbrush', 'Teapot'],
  activities: ['Camping', 'Dancing', 'Swimming', 'Gardening', 'Baking', 'Fishing', 'Skiing', 'Painting', 'Bowling', 'Surfing', 'Hiking', 'Singing', 'Knitting', 'Skateboarding', 'Reading', 'Yoga', 'Juggling', 'Sailing', 'Chess', 'Karaoke', 'Picnic', 'Running', 'Photography', 'Football'],
  'date-night': ['Candlelight', 'Bouquet', 'Serenade', 'Sunset walk', 'Slow dance', 'Love letter', 'First kiss', 'Rooftop dinner', 'Wine tasting', 'Stargazing', 'Proposal', 'Anniversary', 'Chocolate fondue', 'Rose', 'Piano bar', 'Movie night', 'Hand-holding', 'Fireplace', 'Karaoke duet', 'Picnic blanket', 'Photo booth', 'Long-distance call', 'Blind date', 'Honeymoon'],
  holidays: ['Fireworks', 'Christmas tree', 'Menorah', 'Pumpkin', 'Firecracker', 'New Year', 'Easter egg', 'Parade', 'Costume', 'Mistletoe', 'Carnival', 'Lantern festival', 'Turkey dinner', 'Snowman', 'Gift wrap', 'Countdown', 'Candy cane', 'Trick-or-treat', 'Fourth of July', 'Wreath', 'Valentine’s Day', 'Diwali', 'Piñata', 'Harvest festival'],
};
export const words: Word[] = Object.entries(packs).flatMap(([category, entries]) => entries.map((text, index) => ({ id: `${category}-${index}`, text, category: category as Word['category'] })));
const premiumCategoryIds = new Set<Word['category']>(categories.filter(category => category.premium).map(category => category.id) as Word['category'][]);
// The free "mixed" pool never blends in premium-category words, so selecting Mixed bag never
// accidentally hands a non-premium player a premium word.
export function getWords(category: Category) {
  if (category === 'mixed') return words.filter(word => !premiumCategoryIds.has(word.category));
  return words.filter(word => word.category === category);
}
