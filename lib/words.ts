export const categories = [
  { id: 'mixed', name: 'A little of everything', short: 'Mixed bag', hint: 'A surprise from every category' },
  { id: 'food', name: 'Food & drink', short: 'Food & drink', hint: 'Something delicious' },
  { id: 'animals', name: 'Animal kingdom', short: 'Animals', hint: 'Something in the animal kingdom' },
  { id: 'places', name: 'Out & about', short: 'Places', hint: 'Somewhere you can go' },
  { id: 'objects', name: 'Everyday things', short: 'Objects', hint: 'An object you might recognize' },
  { id: 'activities', name: 'Things we do', short: 'Activities', hint: 'Something people do' },
] as const;
export type Category = typeof categories[number]['id'];
export interface Word { id: string; text: string; category: Exclude<Category, 'mixed'>; }
const packs: Record<Exclude<Category, 'mixed'>, string[]> = {
  food: ['Pizza', 'Popcorn', 'Chocolate', 'Sushi', 'Pancake', 'Watermelon', 'Ice cream', 'Spaghetti', 'Croissant', 'Lemonade', 'Taco', 'Cheese', 'Honey', 'Pretzel', 'Pineapple', 'Doughnut', 'Coffee', 'Avocado', 'Waffle', 'Cookie', 'Soup', 'Grapes', 'Sandwich', 'Cereal'],
  animals: ['Penguin', 'Elephant', 'Octopus', 'Giraffe', 'Butterfly', 'Dolphin', 'Kangaroo', 'Flamingo', 'Hedgehog', 'Chameleon', 'Jellyfish', 'Panda', 'Owl', 'Crocodile', 'Squirrel', 'Peacock', 'Turtle', 'Seahorse', 'Camel', 'Bee', 'Fox', 'Rabbit', 'Snail', 'Bat'],
  places: ['Library', 'Airport', 'Beach', 'Museum', 'Cinema', 'Supermarket', 'Lighthouse', 'Castle', 'Aquarium', 'Bakery', 'Playground', 'Train station', 'Desert', 'Waterfall', 'Campsite', 'Stadium', 'Treehouse', 'Restaurant', 'Mountain', 'Zoo', 'Garden', 'Swimming pool', 'Farm', 'Island'],
  objects: ['Umbrella', 'Telescope', 'Toothbrush', 'Backpack', 'Candle', 'Scissors', 'Guitar', 'Mirror', 'Headphones', 'Compass', 'Camera', 'Ladder', 'Bicycle', 'Pillow', 'Kite', 'Suitcase', 'Key', 'Clock', 'Sunglasses', 'Balloon', 'Book', 'Magnet', 'Paintbrush', 'Teapot'],
  activities: ['Camping', 'Dancing', 'Swimming', 'Gardening', 'Baking', 'Fishing', 'Skiing', 'Painting', 'Bowling', 'Surfing', 'Hiking', 'Singing', 'Knitting', 'Skateboarding', 'Reading', 'Yoga', 'Juggling', 'Sailing', 'Chess', 'Karaoke', 'Picnic', 'Running', 'Photography', 'Football'],
};
export const words: Word[] = Object.entries(packs).flatMap(([category, entries]) => entries.map((text, index) => ({ id: `${category}-${index}`, text, category: category as Word['category'] })));
export function getWords(category: Category) { return category === 'mixed' ? words : words.filter(word => word.category === category); }
