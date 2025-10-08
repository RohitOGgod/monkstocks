// Simple mock stock generator for fallback when DB is unavailable

const sampleNames = [
  'Aperture Labs',
  'Globex Corporation',
  'Stark Industries',
  'Wayne Enterprises',
  'Umbrella Corp',
  'Cyberdyne Systems',
  'Initech',
  'Hooli',
  'Vehement Capital',
  'Massive Dynamic',
  'Wonka Industries',
  'Tyrell Corporation',
  'Gringotts Bank',
  'Acme Corp',
  'Duff Beer',
  'Soylent Corp',
  'Oceanic Airlines',
  'Pied Piper',
  'Vandelay Industries',
  'Monsters Inc'
];

const sampleExchanges = ['NYSE', 'NASDAQ'];

function randomTicker() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const len = Math.floor(Math.random() * 2) + 3; // 3-4 letters
  let t = '';
  for (let i = 0; i < len; i++) t += letters[Math.floor(Math.random() * letters.length)];
  return t;
}

function randomPrice() {
  return +(Math.random() * 900 + 10).toFixed(2); // 10.00 - 910.00
}

function randomIdHex(n = 24) {
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < n; i++) out += hex[Math.floor(Math.random() * hex.length)];
  return out;
}

export function generateMockStocks(count = 40) {
  const usedTickers = new Set();
  const stocks = [];
  for (let i = 0; i < count; i++) {
    const name = sampleNames[i % sampleNames.length];
    let ticker = randomTicker();
    // ensure unique ticker
    while (usedTickers.has(ticker)) ticker = randomTicker();
    usedTickers.add(ticker);

    const initialPrice = randomPrice();
    const currentPrice = +(initialPrice * (0.8 + Math.random() * 0.4)).toFixed(2);

    stocks.push({
      _id: randomIdHex(),
      id: i + 1,
      ticker,
      exchange: sampleExchanges[i % sampleExchanges.length],
      name: name + ' ' + ticker,
      initialPrice,
      currentPrice,
      description: `${name} engages in innovative products and services across multiple sectors.`,
      ipoDate: `20${10 + (i % 10)}-0${(i % 9) + 1}-15`,
      siteURL: `https://example.com/${ticker.toLowerCase()}`,
      industries: ['Technology', 'Consumer'],
      icon: `https://logo.clearbit.com/example.com`,
      favorited: false,
      timesBought: Math.floor(Math.random() * 5000),
    });
  }
  return stocks;
}

export function findMockStockById(idOrHex, from = []) {
  if (!from || from.length === 0) return null;
  // try match by _id string
  let found = from.find((s) => s._id === idOrHex);
  if (found) return found;
  // try match numeric id
  const asNum = Number(idOrHex);
  if (!Number.isNaN(asNum)) return from.find((s) => s.id === asNum) || null;
  return null;
}
