export default function(data) {
  const dates = Object.keys(data['Time Series (Daily)']);

  return dates.map((date) => {
    const dailyIbm = data['Time Series (Daily)'][date];
    return {
      date: date,
      open: Number(dailyIbm['1. open']),
      high: Number(dailyIbm['2. high']),
      low: Number(dailyIbm['3. low']),
      close: Number(dailyIbm['4. close']),
      volume: Number(dailyIbm['5. volume']),
      color: Number(dailyIbm['4. close']) > Number(dailyIbm['1. open']) ? 'green' : 'red',
    };
  })
  .slice(0, 250)
  .reverse();
}