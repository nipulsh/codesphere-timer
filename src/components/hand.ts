import { El } from "$src/components/element";

export class Hand {
  static create() {
    return El.create({ type: "div", classes: "hand" });
  }

  static tick(hand: HTMLElement, rotation: number) {
    if (rotation === 135) {
      hand.style.opacity = "0";
    } else {
      hand.style.opacity = "1";
    }
    hand.style.rotate = `${rotation}deg`;
  }
}