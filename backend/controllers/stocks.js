import express from 'express';
import Stock from '../models/stock.js';
import { generateMockStocks, findMockStockById } from '../mock/mockStocks.js';
import { fetchCompanyProfile, fetchQuote } from '../services/marketData/finnhub.js';

const router = express.Router();

async function hydrateFromFinnhubIfConfigured() {
  if (!process.env.FINNHUB_API_KEY) return false;
  // Curated list (allow override via env LIVE_TICKERS)
  const tickers = (process.env.LIVE_TICKERS || 'MSFT,INTC,AAPL,AMZN,GOOGL,META,NVDA').split(',').map(t => t.trim()).filter(Boolean);
  try {
    let order = 1;
    for (const t of tickers) {
      // Fetch profile and quote
      const [profile, quote] = await Promise.all([
        fetchCompanyProfile(t),
        fetchQuote(t)
      ]);
      if (!profile || Object.keys(profile).length === 0) continue;

      const doc = {
        id: order++,
        ticker: t,
        exchange: profile.exchange || profile.exchangeShortName || 'NASDAQ',
        name: profile.name || t,
        initialPrice: Number(quote?.pc) || Number(quote?.c) || 0,
        currentPrice: Number(quote?.c) || Number(quote?.pc) || 0,
        description: profile.finnhubIndustry ? `${profile.finnhubIndustry} company.` : 'Public company.',
        ipoDate: profile.ipo || '',
        siteUrl: profile.weburl || '',
        industries: profile.finnhubIndustry ? [profile.finnhubIndustry] : ['Technology'],
        icon: profile.logo || '',
        favorited: false,
      };

      // Upsert by ticker
      const existing = await Stock.findOne({ ticker: t });
      if (existing) {
        await Stock.updateOne({ _id: existing._id }, { $set: doc });
      } else {
        await Stock.create(doc);
      }
    }
    return true;
  } catch (e) {
    console.log('Finnhub hydrate error:', e?.message || e);
    return false;
  }
}

export const getStocks = async (req, res) => {
  try {
    // Try to hydrate from Finnhub if configured
    await hydrateFromFinnhubIfConfigured();
    const allStocks = await Stock.find().sort({ id: 1 });
    if (allStocks && allStocks.length) {
      return res.status(200).json(allStocks);
    }
    // Fallback to mock data if DB has no stocks
    const mocks = generateMockStocks(48);
    return res.status(200).json(mocks);
  } catch (error) {
    // Fallback to mock data if DB not reachable
    const mocks = generateMockStocks(48);
    return res.status(200).json(mocks);
  }
}

export const getStock = async (req, res) => {
  try {
    const { id } = req.params;
    const oneStock = await Stock.findById(id);
    if (oneStock) {
      return res.status(200).json(oneStock);
    }
    // Fallback: search in mocks
    const mocks = generateMockStocks(48);
    const found = findMockStockById(id, mocks);
    if (found) return res.status(200).json(found);
    return res.status(404).json({ message: "Stock not found." });
  } catch (error) {
    const { id } = req.params;
    const mocks = generateMockStocks(48);
    const found = findMockStockById(id, mocks);
    if (found) return res.status(200).json(found);
    return res.status(404).json({ message: "An error has occurred fetching the stock." });
  }
}

export default router;
