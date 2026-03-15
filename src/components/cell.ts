import { Dot } from "$src/components/dot";
import { El } from "$src/components/element";
import { Hand } from "$src/components/hand";

export class Cell {
  static create(index: number) {
    return El.create({ 
      type: "div", 
      classes: "cell", 
      data: { index },
      children: [Hand.create(), Hand.create(), Dot.create()]
    });
  }

  static tick(cell: HTMLElement, rotation: number[]) {
    const children = El.children(cell);
    Hand.tick(children[0], rotation[0]);
    Hand.tick(children[1], rotation[1]);
    Dot.tick(children[2], rotation);
  }
}