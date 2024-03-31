export function getUnixTimestamp(hh = 0): number {
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime + hh * 60 * 60;
}