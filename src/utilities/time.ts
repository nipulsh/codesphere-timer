import type { Time } from "$src/types/time";

const COUNTDOWN_HOURS = 36;

const pad2 = (n: number) => String(Math.floor(n)).padStart(2, "0");

/**
 * Parses STARTING_DATE (YYYY-MM-DD) and STARTING_TIME (HH:mm or HH:mm:ss)
 * and returns the end timestamp (start + 36 hours).
 */
export const getCountdownEndTime = (startDate: string, startTime: string): number => {
  const [year, month, day] = startDate.split("-").map(Number);
  const parts = startTime.split(":");
  const hours = Number(parts[0]) || 0;
  const minutes = Number(parts[1]) || 0;
  const seconds = Number(parts[2]) || 0;
  // Month is 0-indexed in Date
  const start = new Date(year, month - 1, day, hours, minutes, seconds).getTime();
  return start + COUNTDOWN_HOURS * 60 * 60 * 1000;
};

/**
 * Returns remaining time until endTime as HH, MM, SS (2-digit strings).
 * Shows 00:00:00 when countdown has finished or endTime is in the past.
 */
export const countdown = (endTime: number): Time => {
  const remainingMs = Math.max(0, endTime - Date.now());
  if (remainingMs <= 0) {
    return { hours: "00", minutes: "00", seconds: "00" };
  }
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    hours: pad2(hours),
    minutes: pad2(minutes),
    seconds: pad2(seconds),
  };
};

export const now = (): Time => {
  const time = new Date().toLocaleTimeString("en-US", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const string = time.split(" ")[0];

  const [hours, minutes, seconds] = string.split(":");

  return {
    hours,
    minutes,
    seconds,
  };
};

export const equal = (a: Time, b: Time) => {
  return a.hours === b.hours && a.minutes === b.minutes && a.seconds === b.seconds;
};