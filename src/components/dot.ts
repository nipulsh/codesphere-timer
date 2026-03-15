import { El } from "$src/components/element";

export class Dot {
  static create() {
    return El.create({ type: "div", classes: "dot" });
  }

  static tick(dot: HTMLElement, rotation: number[]) {
    // If both hands are in the neutral 135 position, hide the dot
    if (rotation[0] === 135 && rotation[1] === 135) {
      dot.style.opacity = "0";
    } else {
      dot.style.opacity = "1";
    }
  }
}