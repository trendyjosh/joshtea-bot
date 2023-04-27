/**
 * Format the time remaining for a song.
 * @param timeInSeconds Time in seconds to be formatted
 * @returns The time remainingstring
 */
export function getSongTime(timeInSeconds: number): string {
  const dateObj = new Date(timeInSeconds * 1000);
  const hours = dateObj.getUTCHours(),
    minutes = dateObj.getUTCMinutes(),
    seconds = dateObj.getSeconds();
  const timeString = hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
  return timeString;
}
