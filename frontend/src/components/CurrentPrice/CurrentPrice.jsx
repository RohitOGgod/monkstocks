import React, { useState, useEffect } from "react";

const CurrentPrice = (props) => {
  const { currentPrice, ticker, socket } = props;
  const [price, setPrice] = useState(parseFloat(currentPrice).toFixed(2));
  const [change, setChange] = useState(0.00);
  const [gain, setGain] = useState(true);

  useEffect(() => {
    if (!socket) return; // socket not ready yet
    let mounted = true;
    const handler = (data) => {
      if (!mounted) return;
      const newPriceNum = parseFloat(data);
      const prevPriceNum = parseFloat(price);
      const newPriceStr = newPriceNum.toFixed(2);
      setPrice(newPriceStr);
      if (prevPriceNum > 0) {
        const pct = ((newPriceNum - prevPriceNum) / prevPriceNum) * 100;
        setChange(parseFloat(pct.toFixed(2)));
      }
      setGain(newPriceNum >= prevPriceNum);
    };

    socket.on(ticker, handler);
    return () => {
      mounted = false;
      if (socket && handler) socket.off(ticker, handler);
    }
  }, [socket, ticker]);

  return (
    <>
      {gain ?
        <span className="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
          <span aria-hidden="true" className="absolute inset-0 bg-red-200 dark:bg-red-700 opacity-50 rounded-full">
          </span>
          <span className="relative text-red-500 dark:text-red-400">
            ${price} <span className="ml-2 text-xs hidden xl:inline">+{Math.abs(change)}% up</span>
          </span>
        </span>
        :
        <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
          <span aria-hidden="true" className="absolute inset-0 bg-green-200 dark:bg-green-700 opacity-50 rounded-full">
          </span>
          <span className="relative text-green-500 dark:text-green-40">
            ${price} <span className="ml-2 text-xs hidden xl:inline">-{Math.abs(change)}% down</span>
          </span>
        </span>
      }
    </>
  );
}

export default CurrentPrice;