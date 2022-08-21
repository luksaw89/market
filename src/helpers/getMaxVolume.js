export default function(data) {
  let maxVolume = 0;

  data.forEach((candle) => {
    if(candle.volume > maxVolume) {
      maxVolume = candle.volume;
    }
  });
  return maxVolume;
}