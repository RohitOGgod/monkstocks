import axios from 'axios';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

function getApiKey() {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error('FINNHUB_API_KEY not set');
  return key;
}

export async function fetchCompanyProfile(ticker) {
  const token = getApiKey();
  const url = `${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(ticker)}&token=${token}`;
  const { data } = await axios.get(url);
  return data; // includes: name, weburl, logo, ticker, exchange
}

export async function fetchQuote(ticker) {
  const token = getApiKey();
  const url = `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(ticker)}&token=${token}`;
  const { data } = await axios.get(url);
  // data.c current, data.pc previous close
  return data;
}
