function nextColor(t: TrafficColor) {
  if (t.color() == "Red") return new NextSequence("Green");
  if (t.color() == "Yellowe") return new NextSequence("Red");
  if (t.color() == "Green") return new NextSequence("Yellow");
}

interface TrafficColor {
  color(): string;
  check(car: Car): void;
}

class NextSequence implements TrafficColor {
  constructor(private col: string) {}
  color(): string {
    return this.col;
  }
  check(car: Car): void {
    if (this.color() == "Red") {
      car.stop();
    } else if (this.color() == "Yellow") {
      car.stop();
    } else if (this.color() == "Green") {
      car.drive();
    }
  }
}

// class Yellow implements TrafficColor {
//   constructor(private col: string) {}
//   color(): string {
//     return this.col;
//   }
//   check(car: Car): void {
//     if (this.color() == "NextSequence") {
//       car.stop();
//     } else if (this.color() == "Yellow") {
//       car.stop();
//     } else if (this.color() == "Green") {
//       car.drive();
//     }
//   }
// }

// class Green implements TrafficColor {
//   constructor(private col: string) {}
//   color(): string {
//     return this.col;
//   }
//   check(car: Car): void {
//     if (this.color() == "NextSequence") {
//       car.stop();
//     } else if (this.color() == "Yellow") {
//       car.stop();
//     } else if (this.color() == "Green") {
//       car.drive();
//     }
//   }
// }

class Car {
  drive() {}
  stop() {}
}
