import { El } from "$src/components/element";
import { Field } from "$src/components/field";

import type { Time } from "$src/types/time";

export class Clock {
  static create() {
    const createSeparator = () => {
      const dotStyle = { "background-color": "var(--hand-color)" };
      const dot1 = El.create({ type: "div", classes: "w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 rounded-full", styles: dotStyle });
      const dot2 = El.create({ type: "div", classes: "w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 rounded-full", styles: dotStyle });
      return El.create({
        type: "div",
        classes: "flex flex-col items-center justify-center gap-8 sm:gap-10 md:gap-12 mx-2 sm:mx-3 md:mx-4 opacity-80",
        children: [dot1, dot2]
      });
    };

    const children = [
      Field.create("hours"),
      createSeparator(),
      Field.create("minutes"),
      createSeparator(),
      Field.create("seconds")
    ];

    return El.create({ type: "div", classes: "clock scale-[1.0] sm:scale-[1.1] md:scale-[1.2] lg:scale-[1.25] xl:scale-[1.3] origin-center flex items-center justify-center", children });
  }

  static tick(time: Time) {
    Field.tick("hours", time.hours);
    Field.tick("minutes", time.minutes);
    Field.tick("seconds", time.seconds);

    return time;
  }
}