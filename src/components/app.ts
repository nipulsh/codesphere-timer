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

    // Add Header Container
    const header = El.create({
      type: "div",
      classes: "flex flex-col items-center gap-2",
    });

    const logo = El.create({
      type: "img",
      classes: "w-[55vw] max-w-[400px] md:w-[60vw] md:max-w-[500px] lg:w-[65vw] lg:max-w-[600px] h-auto object-contain drop-shadow-lg"
    }) as HTMLImageElement;
    logo.src = "/CodeSphere-2.png";
    logo.alt = "CodeSphere Logo";
    
    const subtitle = El.create({
      type: "h1",
      classes: "text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.2em] text-transparent text-center z-10 [-webkit-text-stroke:1.5px_#ffffff]",
      content: "36 HOUR HACKATHON"
    });

    header.appendChild(logo);
    header.appendChild(subtitle);
    
    El.append("app", header);
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