import React, { useEffect } from "react";
import { Chart, registerables } from 'chart.js';

const PriceChart = (props) => {
  const { id, legendDisplay, xDisplay, yDisplay, socket, ticker, currPrice, styleSet } = props;
  Chart.register(...registerables);

  useEffect(() => {
    let mounted = true;

    const ctx = document.getElementById(id);
    if (!ctx) return; // canvas not ready
    const data = {
      labels: [currPrice.toFixed(2) || 0],
      datasets: [{
        data: [currPrice.toFixed(2) || 0],
        label: 'Price',
        backgroundColor: '#10B981',
        borderColor: '#10B981'
      }]
    }

    const optionsSet = {
      animation: true,
      plugins: {
        legend: {
          display: legendDisplay
        },
      },
      responsive: true,
      scales: {
        x: {
          display: xDisplay
        },
        y: {
          display: yDisplay
        }
      }
    }

    const chartDrawn = new Chart(ctx, {
      type: 'line',
      data: data,
      options: optionsSet
    });

    let prevMsg = currPrice;
    const handler = (msg) => {
      if (!mounted) return;
      const length = data.labels.length;
      if (length >= 5) {
        data.datasets[0].data.shift();
        data.labels.shift();
      }
      if (msg > prevMsg) {
        data.datasets[0].borderColor = '#10B981';
        data.datasets[0].backgroundColor = '#10B981';
      } else {
        data.datasets[0].borderColor = '#EF4444';
        data.datasets[0].backgroundColor = '#EF4444';
      }
      prevMsg = msg;
      data.labels.push(new Date().getTime());
      const parsed = parseFloat(msg);
      data.datasets[0].data.push(isNaN(parsed) ? 0 : parsed);
      chartDrawn.update();
    };

    if (socket) {
      socket.on(ticker, handler);
    }

    return () => {
      mounted = false
      if (socket && handler) socket.off(ticker, handler);
      chartDrawn.destroy();
    }
  }, [id, legendDisplay, xDisplay, yDisplay, socket, ticker, currPrice]);



  return (
    <div className={styleSet}>
      <canvas id={id}></canvas>
    </div>
  );
}

export default PriceChart;