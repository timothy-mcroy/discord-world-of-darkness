class Roller {
  static roll(n) {
    return new Array(n).fill(0).map(() => 1 + Math.floor(Math.random() * 10));
  }
}

module.exports = Roller;
