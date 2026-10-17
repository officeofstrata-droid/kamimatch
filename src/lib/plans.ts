export const PREMIUM_MONTHLY_GBP = 7.99;
export const PHOTO_ALLOWANCE = { free: 2, premium: 10 };
export const FREE_FEATURES = ['Unlimited likes & mutual matches', 'Text chat & voice notes', 'Top 10 anime, characters & moments', 'Shared-taste compatibility', 'Join watch parties & clubs', 'Host rooms & find seasonal buddies', 'Spoiler-shielded chat & watch bingo', '2 anime photo conversions each month', 'Blocking, reporting & identity checks'];
export const PREMIUM_FEATURES = ['Everything in Free', 'Upload & watch profile videos', '10 anime photo conversions each month', 'Cinematic & manga (comic) photo styles', 'See who already likes you', 'Rewind your last passed profile', 'Filter by city, age & shared anime'];
export function videoAllowed(premium: boolean): boolean { return premium; }
