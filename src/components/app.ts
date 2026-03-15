import { Clock } from "$src/components/clock";
import { El } from "$src/components/element";

import { countdown, equal, getCountdownEndTime } from "$src/utilities/time";

import type { Time } from "$src/types/time";

export class App {
  static time: Time = { hours: "00", minutes: "00", seconds: "00" };

  static endTime: number = 0;

  static init() {
    const startDate =
      (import.meta as unknown as { env: Record<string, string> }).env
        .VITE_STARTING_DATE ?? "2026-03-15";
    const startTime =
      (import.meta as unknown as { env: Record<string, string> }).env
        .VITE_STARTING_TIME ?? "00:00";

    this.endTime = getCountdownEndTime(startDate, startTime);
    this.time = countdown(this.endTime);

    El.append("app", Clock.create());

    this.tick();
  }

  static interval() {
    const time = countdown(this.endTime);

    if (!equal(time, this.time)) {
      this.time = Clock.tick(time);
    }
  }

  static tick() {
    Clock.tick(this.time);

    setInterval(() => this.interval(), 100);
  }
}