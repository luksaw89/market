export default function(data) {
  let max = 0;

  data.forEach((candle) => {
    if(candle.high > max) {
      max = candle.high;
    }
  });
  return max;
}