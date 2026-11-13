// Writes the stats card's numbers into its alt text, and the view count into
// the counter's, so a screen reader hears what the pictures show. A picture's
// alt can't change by itself, so the workflow runs this every day.

import { readFileSync, writeFileSync } from 'node:fs';

const BASE = 'https://stats.niso.moe';
const USER = 'CuteNikki';
const README = 'README.md';

const response = await fetch(`${BASE}/stats.json?user=${USER}`);
if (!response.ok) throw new Error(`stats.json answered ${response.status}`);
const s = await response.json();

const n = (value) => value.toLocaleString('en-US');
const days = (count) => `${n(count)} ${count === 1 ? 'day' : 'days'}`;
const list = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items.join(''));

const card =
  `${s.name}'s GitHub stats: ${n(s.commits)} commits, ${n(s.pullRequests)} pull requests, ${n(s.issues)} issues, ` +
  `${n(s.stars)} stars earned and ${n(s.repos)} repositories. ` +
  `Current streak: ${days(s.streak.current)}, longest: ${days(s.streak.longest)}, ${n(s.contributions)} contributions in all. ` +
  `Top languages: ${list(s.languages.map((l) => `${l.name} ${l.share}`))}. ` +
  `${n(s.lastYear)} contributions in the last year.`;
const views = `Profile views: ${n(s.views)}, counted since July 2026`;

/** Replaces the alt of the <img> whose link starts with path */
function setAlt(readme, path, alt) {
  const pattern = new RegExp(`(<img src="${BASE.replace(/\./g, '\\.')}${path.replace(/[?]/g, '\\?')}[^"]*" alt=")[^"]*(")`);
  if (!pattern.test(readme)) throw new Error(`No picture of ${path} in ${README}`);
  return readme.replace(pattern, `$1${alt.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}$2`);
}

const before = readFileSync(README, 'utf8');
let after = setAlt(before, '/card?', card);
after = setAlt(after, '/views?', views);

if (after === before) console.log('Alt text is up to date');
else {
  writeFileSync(README, after);
  console.log(`Card: ${card}\nViews: ${views}`);
}
