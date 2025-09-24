import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Stock from '../models/stock.js';
import { generateMockStocks } from '../mock/mockStocks.js';

dotenv.config();

const CONNECTION_URL = process.env.MONGO_CONNECTION_STRING;

async function run() {
  if (!CONNECTION_URL) {
    console.error('Missing MONGO_CONNECTION_STRING in backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(CONNECTION_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    const count = await Stock.countDocuments();
    if (count > 0) {
      console.log(`Stocks collection already has ${count} documents. Skipping seed.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const mocks = generateMockStocks(100);

    // Map mock fields to Stock schema fields where needed
    const docs = mocks.map((m) => ({
      id: m.id,
      ticker: m.ticker,
      exchange: m.exchange,
      name: m.name,
      initialPrice: m.initialPrice,
      currentPrice: m.currentPrice,
      description: m.description,
      ipoDate: m.ipoDate,
      siteUrl: m.siteURL,
      industries: m.industries,
      icon: m.icon,
      favorited: m.favorited,
      timesBought: m.timesBought,
    }));

    await Stock.insertMany(docs);
    const newCount = await Stock.countDocuments();
    console.log(`Seeded ${newCount} stocks successfully.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
}

run();
