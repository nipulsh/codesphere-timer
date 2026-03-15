import { io, Socket } from "socket.io-client";
import { Clock } from "$src/components/clock";
import { El } from "$src/components/element";

import { countdown, equal } from "$src/utilities/time";

import type { Time } from "$src/types/time";

export class App {
  static time: Time = { hours: "00", minutes: "00", seconds: "00" };

  static endTime: number = 0;
  static isPaused: boolean = false;
  static pauseTimeRemaining: number = 0;
  static socket: Socket | null = null;
  static intervalId: number | null = null;

  static init() {
    this.socket = io();

    this.socket.on('timerState', (state) => {
      this.endTime = state.endTime;
      this.isPaused = state.isPaused;
      this.pauseTimeRemaining = state.pauseTimeRemaining;
      
      this.interval(); // Trigger immediate visual update
    });

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
    let targetTime = this.endTime;
    if (this.isPaused) {
      targetTime = Date.now() + this.pauseTimeRemaining;
    }

    const time = countdown(targetTime);

    if (!equal(time, this.time)) {
      this.time = Clock.tick(time);
    }
  }

  static tick() {
    Clock.tick(this.time);

    if (this.intervalId !== null) clearInterval(this.intervalId);
    this.intervalId = window.setInterval(() => this.interval(), 100);
  }
}