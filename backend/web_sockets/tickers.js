import { stockPrice } from './markets.js';
import Stock from '../models/stock.js';
import { generateMockStocks } from '../mock/mockStocks.js';
import { fetchQuote } from '../services/marketData/finnhub.js';

const tickers = async (socket) => {
    try {
        let allStocks = [];
        try {
            allStocks = await Stock.find();
        } catch (e) {
            allStocks = [];
        }

        if (!allStocks || allStocks.length === 0) {
            // Fallback to mock stocks if DB not available or empty
            allStocks = generateMockStocks(40);
        }

        // If FINNHUB_API_KEY is set, poll live quotes periodically and emit
        if (process.env.FINNHUB_API_KEY) {
            const POLL_MS = Number(process.env.LIVE_POLL_MS || 10000); // default 10s
            let stopped = false;

            const interval = setInterval(async () => {
                if (stopped || !socket.connected) return;
                try {
                    for (const s of allStocks) {
                        try {
                            const q = await fetchQuote(s.ticker);
                            const price = Number(q?.c) || Number(q?.pc) || Number(s.currentPrice) || 0;
                            if (!Number.isFinite(price) || price <= 0) continue;
                            await Stock.updateOne({ _id: s._id }, { $set: { currentPrice: price } });
                            socket.emit(s.ticker, price.toFixed(2));
                        } catch (inner) {
                            // Ignore individual ticker failures to avoid breaking the loop
                        }
                    }
                } catch (err) {
                    // Soft-fail on API errors
                }
            }, POLL_MS);

            socket.on('disconnect', () => {
                stopped = true;
                clearInterval(interval);
            });
        } else {
            // No live API: fall back to local fluctuation generator per stock
            for (let i = 0; i < allStocks.length; i++) {
                const fluctuationRange = Math.floor(Math.random() * 10);
                const delayTime = Math.floor(Math.random() * (3000 - 1500) + 1500);
                stockPrice(
                    socket,
                    allStocks[i].currentPrice,
                    delayTime,
                    allStocks[i].ticker,
                    fluctuationRange,
                    allStocks[i].id
                );
            }
        }
    } catch (error) {
        console.log("Stock fetching error:", error);
    }
}

export { tickers }
