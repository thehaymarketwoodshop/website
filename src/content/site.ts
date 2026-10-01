/**
 * Site content + brand levers.
 *
 * This file is the template boundary: to reuse the site for another maker,
 * replace the values here (plus the tokens in globals.css and the images in
 * /public/media). Every fact below comes from the current
 * thehaymarketwoodshop.com site — items marked CONFIRM need the owner's sign-off.
 */

export const brand = {
  name: 'The Haymarket Woodshop',
  shortName: 'Haymarket Woodshop',
  location: 'Haymarket, Virginia',
  email: 'thehaymarketwoodshop@gmail.com',
  replyTime: 'We reply within 24 hours',
  // CONFIRM: contact page says 2–10 weeks; care guide says 4–12 weeks for custom work.
  leadTime: 'Lead times vary by piece, typically a few weeks',
  tagline: 'Built once. Kept for generations.',
};

export const nav = [
  { href: '/products', label: 'Shop' },
  { href: '/custom-order', label: 'Commission' },
  { href: '/woods', label: 'Materials' },
  { href: '/about', label: 'Studio' },
  { href: '/contact', label: 'Contact' },
];

export const secondaryNav = [
  { href: '/woods#stains', label: 'Stain samples' },
  { href: '/care-guide', label: 'Care & FAQ' },
];

export const legalNav = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

export type Discipline = {
  slug: string;
  index: string;
  title: string;
  lede: string;
  body: string;
  meta: { label: string; value: string }[];
  image: string;
  imageAlt: string;
  /** CSS object-position for cropping the image inside its frame. */
  imagePosition?: string;
  tone: 'espresso' | 'bone' | 'ivory';
  layout: 'bleed' | 'split' | 'split-reverse';
  cta: { href: string; label: string };
};

export const disciplines: Discipline[] = [
  {
    slug: 'dining-tables',
    index: '01',
    title: 'Dining Tables',
    lede: 'The piece a family gathers around.',
    body: 'Solid hardwood tables sized to your room and finished for everyday meals — durable enough for daily use, made to be passed down.',
    meta: [
      { label: 'Woods', value: 'Walnut · White oak · Maple' },
      { label: 'Finish', value: 'Durable matte furniture finish' },
    ],
    image: '/media/grain-walnut.jpg',
    imageAlt: 'Close study of walnut grain',
    tone: 'espresso',
    layout: 'bleed',
    cta: { href: '/custom-order', label: 'Commission a table' },
  },
  {
    slug: 'cabinetry',
    index: '02',
    title: 'Cabinetry',
    lede: 'Storage that belongs to the room.',
    body: 'Cabinets drawn to your space, with premium prefinished plywood boxes for stability and a durable matte finish on every exterior.',
    meta: [
      { label: 'Best in', value: 'White oak · Walnut' },
      { label: 'Construction', value: 'Prefinished plywood boxes' },
    ],
    image: '/media/grain-oak.jpg',
    imageAlt: 'Close study of white oak grain',
    tone: 'bone',
    layout: 'split',
    cta: { href: '/custom-order', label: 'Request a quote' },
  },
  {
    slug: 'built-ins',
    index: '03',
    title: 'Built-ins',
    lede: 'Woodwork that reads as architecture.',
    body: 'Shelving, window seats and fitted pieces designed around the way you live in a room, then built to stay.',
    meta: [
      { label: 'Woods', value: 'Walnut · White oak · Maple' },
      { label: 'Process', value: 'Measured, drawn and quoted with you' },
    ],
    image: '/media/grain-walnut-dark.jpg',
    imageAlt: 'Close study of dark walnut grain',
    tone: 'espresso',
    layout: 'split-reverse',
    cta: { href: '/custom-order', label: 'Start a built-in' },
  },
  {
    slug: 'custom-furniture',
    index: '04',
    title: 'Custom Furniture',
    lede: 'Drawn for one home. Yours.',
    body: 'Tables, benches, shelving and bookcases built to your exact specifications — from a ladder bookshelf to a one-of-a-kind centerpiece.',
    meta: [
      { label: 'Start with', value: 'A sketch, a photo or a render' },
      { label: 'You choose', value: 'Wood, stain, finish, dimensions' },
    ],
    image: '/media/grain-maple.jpg',
    imageAlt: 'Close study of maple grain',
    tone: 'ivory',
    layout: 'split',
    cta: { href: '/custom-order', label: 'Start a custom order' },
  },
  {
    slug: 'cutting-boards',
    index: '05',
    title: 'Cutting Boards',
    lede: 'Functional art for the kitchen.',
    body: 'Edge-grain and end-grain boards in walnut, maple and oak, finished food-safe and made to be used every day.',
    meta: [
      { label: 'Construction', value: 'Edge grain · End grain' },
      { label: 'Finish', value: 'Food-safe, non-toxic' },
    ],
    image: '/media/board-photo.webp',
    imageAlt: 'Striped walnut and maple edge-grain cutting board on the bench',
    imagePosition: '50% 62%',
    tone: 'espresso',
    layout: 'split-reverse',
    cta: { href: '/products', label: 'Shop boards' },
  },
];

export const boardStory = [
  {
    kicker: 'i.',
    title: 'It starts with the board.',
    body: 'Hardwood is chosen one board at a time — for grain, stability and character.',
  },
  {
    kicker: 'ii.',
    title: 'Walnut, maple, walnut.',
    body: 'Strips are milled and arranged by hand so contrasting species sit edge to edge.',
  },
  {
    kicker: 'iii.',
    title: 'Glued, flattened, shaped.',
    body: 'The glue-up is flattened and the edges are eased so the board feels right in the hand.',
  },
  {
    kicker: 'iv.',
    title: 'Finished food-safe.',
    body: 'A food-safe, non-toxic finish protects the wood and keeps its natural color and grain.',
  },
];

export const process = [
  {
    index: '01',
    title: 'Tell us about it',
    body: 'Describe what you have in mind. Dimensions, wood preferences and a reference image or render all help.',
  },
  {
    index: '02',
    title: 'We talk it through',
    body: 'A consultation on dimensions, wood, finish and timeline — directly with the person building your piece.',
  },
  {
    index: '03',
    title: 'Review & sign',
    body: 'Your quote arrives as an online invoice you can review and sign from any device.',
  },
  {
    index: '04',
    title: 'Built by hand',
    body: 'Your piece is crafted in the shop, with regular updates along the way, then finished and delivered.',
  },
];

export const woods = [
  {
    name: 'Walnut',
    character: 'Bold, warm, premium',
    bestFor: 'Tables, desks, cabinetry, accent pieces',
    body: 'Rich dark tones and striking grain, from deep chocolate to warm purple.',
    image: '/media/grain-walnut.jpg',
  },
  {
    name: 'White Oak',
    character: 'Clean, structured, enduring',
    bestFor: 'Dining tables, cabinetry, built-ins',
    body: 'Strong and distinctive, with a lighter, more modern appearance.',
    image: '/media/grain-oak.jpg',
  },
  {
    name: 'Maple',
    character: 'Light, minimal, precise',
    bestFor: 'Cutting boards, small goods, contemporary furniture',
    body: 'Bright and clean with subtle grain and exceptional hardness.',
    image: '/media/grain-maple.jpg',
  },
];

export const testimonials = [
  {
    quote:
      'From start to finish, The Haymarket Woodshop demonstrated exceptional craftsmanship, attention to detail, and professionalism. The final product exceeded my expectations in every way.',
    author: 'Corry R.',
  },
  {
    quote:
      'It has now been about a month since we moved the table into our apartment and we love it! We are overall very pleased with this one-of-a-kind piece.',
    author: 'Nicholas L.',
    piece: 'Dining table',
  },
  {
    quote:
      'I’m incredibly pleased with the ladder bookshelf that Mujib built for me. It is exactly what I wanted for my space, and the quality is amazing.',
    author: 'Delanie C.',
    piece: 'Ladder bookshelf',
  },
];

export const values = [
  { title: 'Solid hardwood', body: 'Walnut, maple, oak and cherry from suppliers who care about sustainability.' },
  { title: 'Honest construction', body: 'No particle board, no veneer, no shortcuts. Joinery designed to last for generations.' },
  { title: 'Thoughtful design', body: 'Form follows function — but beauty matters too.' },
  { title: 'Personal service', body: 'You work directly with the person building your piece. No middlemen.' },
];

export type StainWood = 'Walnut' | 'Oak' | 'Maple';

/** Stain samples photographed in the shop. Shown on the homepage and Materials page. */
export const stains: Record<StainWood, { label: string; image: string }[]> = {
  Walnut: [
    { label: 'Almond', image: '/placeholders/walnutalmond.jpg' },
    { label: 'Pure', image: '/placeholders/walnutpure.jpg' },
    { label: 'Walnut', image: '/placeholders/walnutwalnut.jpg' },
  ],
  Oak: [
    { label: 'Honey', image: '/placeholders/oakhoney.jpg' },
    { label: 'Pure', image: '/placeholders/oakpure.jpg' },
    { label: 'Vanilla', image: '/placeholders/oakvanilla.jpg' },
    { label: 'White', image: '/placeholders/oakwhite.jpg' },
    { label: 'White 5%', image: '/placeholders/oakwhite5.jpg' },
  ],
  Maple: [
    { label: 'Natural', image: '/placeholders/maplenatural.jpg' },
    { label: 'White 5%', image: '/placeholders/maplewhite5.jpg' },
  ],
};

export const finishes = [
  {
    title: 'Food-safe finish',
    body: 'For anything that touches food: a food-safe, non-toxic finish that protects the wood while preserving its natural color and grain.',
    usedFor: 'Cutting boards, charcuterie boards, serving pieces',
  },
  {
    title: 'Matte furniture finish',
    body: 'A high-quality matte finish that enhances the wood’s character and protects against daily wear without excessive shine.',
    usedFor: 'Tables, desks, furniture, cabinetry exteriors',
  },
  {
    title: 'Cabinet construction',
    body: 'Premium prefinished plywood for cabinet boxes — stable, smooth and ideal for paint, with a clean, professional interior built to last.',
    usedFor: 'Cabinets',
  },
];
