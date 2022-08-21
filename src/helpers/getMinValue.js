export default function(data) {
  let min = Math.min();

  data.forEach((session) => {
    if(session.low < min) {
      min = session.low;
    }
  });
  return min;
}