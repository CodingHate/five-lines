const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

let playerx = 1;
let playery = 1;
let rawmap: RawTile[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 6, 1, 2, 0, 2],
  [2, 8, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 9, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];
let map: Tile[][];

let inputs: Input[] = [];

enum RawTile {
  AIR,
  FLUX,
  UNBREAKABLE,
  PLAYER,
  STONE,
  FALLING_STONE,
  BOX,
  FALLING_BOX,
  KEY1,
  LOCK1,
  KEY2,
  LOCK2,
}
enum RawInput {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

interface FallingState {
  isFalling(): boolean;
  isResting(): boolean;
  moveHorizontal(tile: Tile, dx: number): void;
}

class Falling implements FallingState {
  moveHorizontal(tile: Tile, dx: number): void {}
  isFalling(): boolean {
    return true;
  }
  isResting(): boolean {
    return false;
  }
}

class Resting implements FallingState {
  moveHorizontal(tile: Tile, dx: number): void {
    if (
      map[playery][playery + dx + dx].isAir() &&
      !map[playery + 1][playerx + dx].isAir()
    ) {
      map[playery][playerx + dx + dx] = tile;
      moveToTile(playerx + dx, playery);
    }
  }
  isFalling(): boolean {
    return false;
  }
  isResting(): boolean {
    return true;
  }
}

interface Input {
  handle(): void;
}

class Right implements Input {
  handle() {
    moveHorizontal(1);
  }
}
class Left implements Input {
  handle() {
    moveHorizontal(-1);
  }
}
class Up implements Input {
  handle() {
    moveVertical(-1);
  }
}
class Down implements Input {
  handle() {
    moveVertical(1);
  }
}

function assertExhausted(x: never): never {
  throw new Error("Unexpected object: " + x);
}

function transformTile(title: RawTile) {
  switch (title) {
    case RawTile.AIR:
      return new Air();
    case RawTile.BOX:
      return new Box();
    case RawTile.FALLING_BOX:
      return new FallingBox();
    case RawTile.FALLING_STONE:
      return new Stone(new Resting());
    case RawTile.FLUX:
      return new Flux();
    case RawTile.KEY1:
      return new Key1();
    case RawTile.KEY2:
      return new Key2();
    case RawTile.LOCK1:
      return new Lock1();
    case RawTile.LOCK2:
      return new Lock2();
    case RawTile.PLAYER:
      return new Player();
    case RawTile.STONE:
      return new Stone(new Resting());
    case RawTile.UNBREAKABLE:
      return new Unbreakable();
  }
}

function transformMap() {
  map = new Array(rawmap.length);
  for (let y = 0; y < rawmap.length; y++) {
    map[y] = new Array(rawmap[y].length);
    for (let x = 0; x < rawmap[y].length; x++) {
      map[y][x] = transformTile(rawmap[y][x]);
      console.log(rawmap[y][x] + " : " + y + " , " + x);
    }
  }
}

function removeLock1() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x].isLock1()) {
        map[y][x] = new Air();
      }
    }
  }
}

function removeLock2() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x].isLock2()) {
        map[y][x] = new Air();
      }
    }
  }
}

function moveToTile(newx: number, newy: number) {
  map[playery][playerx] = new Air();
  map[newy][newx] = new Player();
  playerx = newx;
  playery = newy;
}

function moveHorizontal(dx: number) {
  map[playery][playerx + dx].moveHorizontal(dx);
}

function moveVertical(dy: number) {
  if (
    map[playery + dy][playerx].isFlux() ||
    map[playery + dy][playerx].isAir()
  ) {
    moveToTile(playerx, playery + dy);
  } else if (map[playery + dy][playerx].isKey1()) {
    // remove(new Lock1());
    removeLock1();
    moveToTile(playerx, playery + dy);
  } else if (map[playery + dy][playerx].isKey2()) {
    removeLock2();
    moveToTile(playerx, playery + dy);
  }
}

function update() {
  handleInputs();
  updateMap();
}

function handleInputs() {
  while (inputs.length > 0) {
    // let current = inputs.pop();
    // handleInput(current);
    let input = inputs.pop();
    input.handle(); // inline화
  }
}

interface Tile {
  isAir(): boolean;
  isPlayer(): boolean;
  isFlux(): boolean;
  isUnbreakable(): boolean;
  isStone(): boolean;
  isFallingStone(): boolean;
  isBox(): boolean;
  isFallingBox(): boolean;
  isKey1(): boolean;
  isKey2(): boolean;
  isLock1(): boolean;
  isLock2(): boolean;
  color(g: CanvasRenderingContext2D): void;
  draw(g: CanvasRenderingContext2D, x: number, y: number): void;
  isEdible(): boolean;
  isPushable(): boolean;
  moveHorizontal(dx: number): void;
  drop(): void;
  rest(): void;
}

class Air implements Tile {
  drop(): void {}
  rest(): void {}
  isAir(): boolean {
    return true;
  }
  isPlayer(): boolean {
    return false;
  }
  isFlux(): boolean {
    return false;
  }
  isUnbreakable(): boolean {
    return false;
  }
  isStone(): boolean {
    return false;
  }
  isFallingStone(): boolean {
    return false;
  }
  isBox(): boolean {
    return false;
  }
  isFallingBox(): boolean {
    return false;
  }
  isKey1(): boolean {
    return false;
  }
  isKey2(): boolean {
    return false;
  }
  isLock1(): boolean {
    return false;
  }
  isLock2(): boolean {
    return false;
  }
  color(g: CanvasRenderingContext2D): void {}
  draw(g: CanvasRenderingContext2D, x: number, y: number): void {}
  isEdible(): boolean {
    return true;
  }
  isPushable(): boolean {
    return false;
  }
  moveHorizontal(dx: number): void {
    moveToTile(playerx + dx, playery);
  }
}

class Player implements Tile {
  drop(): void {}
  rest(): void {}
  isAir(): boolean {
    return false;
  }
  isPlayer(): boolean {
    return true;
  }
  isFlux(): boolean {
    return false;
  }
  isUnbreakable(): boolean {
    return false;
  }
  isStone(): boolean {
    return false;
  }
  isFallingStone(): boolean {
    return false;
  }
  isBox(): boolean {
    return false;
  }
  isFallingBox(): boolean {
    return false;
  }
  isKey1(): boolean {
    return false;
  }
  isKey2(): boolean {
    return false;
  }
  isLock1(): boolean {
    return false;
  }
  isLock2(): boolean {
    return false;
  }
  color(g: CanvasRenderingContext2D): void {}
  draw(g: CanvasRenderingContext2D, x: number, y: number): void {}
  isEdible(): boolean {
    return false;
  }
  isPushable(): boolean {
    return false;
  }
  moveHorizontal(dx: number): void {}
}

class Unbreakable implements Tile {
  drop(): void {}
  rest(): void {}
  isAir(): boolean {
    return false;
  }
  isPlayer(): boolean {
    return false;
  }
  isFlux(): boolean {
    return false;
  }
  isUnbreakable(): boolean {
    return true;
  }
  isStone(): boolean {
    return false;
  }
  isFallingStone(): boolean {
    return false;
  }
  isBox(): boolean {
    return false;
  }
  isFallingBox(): boolean {
    return false;
  }
  isKey1(): boolean {
    return false;
  }
  isKey2(): boolean {
    return false;
  }
  isLock1(): boolean {
    return false;
  }
  isLock2(): boolean {
    return false;
  }
  color(g: CanvasRenderingContext2D): void {
    g.fillStyle = "#999999";
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number): void {
    g.fillStyle = "#999999";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  isEdible(): boolean {
    return false;
  }
  isPushable(): boolean {
    return false;
  }
  moveHorizontal(dx: number): void {}
}

class Flux implements Tile {
  drop(): void {}
  rest(): void {}
  isAir(): boolean {
    return false;
  }
  isPlayer(): boolean {
    return false;
  }
  isFlux(): boolean {
    return true;
  }
  isUnbreakable(): boolean {
    return false;
  }
  isStone(): boolean {
    return false;
  }
  isFallingStone(): boolean {
    return false;
  }
  isBox(): boolean {
    return false;
  }
  isFallingBox(): boolean {
    return false;
  }
  isKey1(): boolean {
    return false;
  }
  isKey2(): boolean {
    return false;
  }
  isLock1(): boolean {
    return false;
  }
  isLock2(): boolean {
    return false;
  }
  color(g: CanvasRenderingContext2D): void {
    g.fillStyle = "#ccffcc";
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number): void {
    g.fillStyle = "#ccffcc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  isEdible(): boolean {
    return true;
  }
  isPushable(): boolean {
    return false;
  }
  moveHorizontal(dx: number): void {
    if (map[playery][playerx + dx].isEdible()) {
      moveToTile(playerx + dx, playery);
    }
  }
}

class Stone implements Tile {
  constructor(private falling: FallingState) {
    this.falling = falling;
  }
  drop(): void {
    this.falling = new Falling();
  }
  rest(): void {
    this.falling = new Resting();
  }

  isAir(): boolean {
    return false;
  }
  isPlayer(): boolean {
    return false;
  }
  isFlux(): boolean {
    return false;
  }
  isUnbreakable(): boolean {
    return false;
  }
  isStone(): boolean {
    return true;
  }
  isFallingStone(): boolean {
    return this.falling.isFalling();
  }
  isBox(): boolean {
    return false;
  }
  isFallingBox(): boolean {
    return false;
  }
  isKey1(): boolean {
    return false;
  }
  isKey2(): boolean {
    return false;
  }
  isLock1(): boolean {
    return false;
  }
  isLock2(): boolean {
    return false;
  }
  color(g: CanvasRenderingContext2D): void {
    g.fillStyle = "#0000cc";
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number): void {
    g.fillStyle = "#0000cc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  isEdible(): boolean {
    return false;
  }
  isPushable(): boolean {
    return false;
  }
  moveHorizontal(dx: number): void {
    this.falling.moveHorizontal(this, dx);
  }
}

class Box implements Tile {
  drop(): void {}
  rest(): void {}
  isAir(): boolean {
    return false;
  }
  isPlayer(): boolean {
    return false;
  }
  isFlux(): boolean {
    return false;
  }
  isUnbreakable(): boolean {
    return false;
  }
  isStone(): boolean {
    return false;
  }
  isFallingStone(): boolean {
    return false;
  }
  isBox(): boolean {
    return true;
  }
  isFallingBox(): boolean {
    return false;
  }
  isKey1(): boolean {
    return false;
  }
  isKey2(): boolean {
    return false;
  }
  isLock1(): boolean {
    return false;
  }
  isLock2(): boolean {
    return false;
  }
  color(g: CanvasRenderingContext2D): void {
    g.fillStyle = "#8b4513";
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number): void {
    g.fillStyle = "#8b4513";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  isEdible(): boolean {
    return false;
  }
  isPushable(): boolean {
    return true;
  }
  moveHorizontal(dx: number): void {
    if (
      map[playery][playerx + dx + dx].isAir() &&
      !map[playery][playerx + dx].isAir()
    ) {
      map[playery][playerx + dx + dx] = this;
      moveToTile(playerx + dx, playery);
    }
  }
}

class FallingBox implements Tile {
  drop(): void {}
  rest(): void {}
  isAir(): boolean {
    return false;
  }
  isPlayer(): boolean {
    return false;
  }
  isFlux(): boolean {
    return false;
  }
  isUnbreakable(): boolean {
    return false;
  }
  isStone(): boolean {
    return false;
  }
  isFallingStone(): boolean {
    return false;
  }
  isBox(): boolean {
    return false;
  }
  isFallingBox(): boolean {
    return true;
  }
  isKey1(): boolean {
    return false;
  }
  isKey2(): boolean {
    return false;
  }
  isLock1(): boolean {
    return false;
  }
  isLock2(): boolean {
    return false;
  }
  color(g: CanvasRenderingContext2D): void {
    g.fillStyle = "#8b4513";
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number): void {
    g.fillStyle = "#8b4513";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  isEdible(): boolean {
    return false;
  }
  isPushable(): boolean {
    return false;
  }
  moveHorizontal(dx: number): void {}
}

class Key1 implements Tile {
  drop(): void {}
  rest(): void {}
  isAir(): boolean {
    return false;
  }
  isPlayer(): boolean {
    return false;
  }
  isFlux(): boolean {
    return false;
  }
  isUnbreakable(): boolean {
    return false;
  }
  isStone(): boolean {
    return false;
  }
  isFallingStone(): boolean {
    return false;
  }
  isBox(): boolean {
    return false;
  }
  isFallingBox(): boolean {
    return false;
  }
  isKey1(): boolean {
    return true;
  }
  isKey2(): boolean {
    return false;
  }
  isLock1(): boolean {
    return false;
  }
  isLock2(): boolean {
    return false;
  }
  color(g: CanvasRenderingContext2D): void {
    g.fillStyle = "#ffcc00";
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number): void {
    g.fillStyle = "#ffcc00";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  isEdible(): boolean {
    return false;
  }
  isPushable(): boolean {
    return false;
  }
  moveHorizontal(dx: number): void {
    removeLock1();
    moveToTile(playerx + dx, playery);
  }
}

class Key2 implements Tile {
  drop(): void {}
  rest(): void {}
  isAir(): boolean {
    return false;
  }
  isPlayer(): boolean {
    return false;
  }
  isFlux(): boolean {
    return false;
  }
  isUnbreakable(): boolean {
    return false;
  }
  isStone(): boolean {
    return false;
  }
  isFallingStone(): boolean {
    return false;
  }
  isBox(): boolean {
    return false;
  }
  isFallingBox(): boolean {
    return false;
  }
  isKey1(): boolean {
    return false;
  }
  isKey2(): boolean {
    return true;
  }
  isLock1(): boolean {
    return false;
  }
  isLock2(): boolean {
    return false;
  }
  color(g: CanvasRenderingContext2D): void {}
  draw(g: CanvasRenderingContext2D, x: number, y: number): void {}
  isEdible(): boolean {
    return false;
  }
  isPushable(): boolean {
    return false;
  }
  moveHorizontal(dx: number): void {}
}

class Lock1 implements Tile {
  drop(): void {}
  rest(): void {}
  isAir(): boolean {
    return false;
  }
  isPlayer(): boolean {
    return false;
  }
  isFlux(): boolean {
    return false;
  }
  isUnbreakable(): boolean {
    return false;
  }
  isStone(): boolean {
    return false;
  }
  isFallingStone(): boolean {
    return false;
  }
  isBox(): boolean {
    return false;
  }
  isFallingBox(): boolean {
    return false;
  }
  isKey1(): boolean {
    return false;
  }
  isKey2(): boolean {
    return false;
  }
  isLock1(): boolean {
    return true;
  }
  isLock2(): boolean {
    return false;
  }
  color(g: CanvasRenderingContext2D): void {
    g.fillStyle = "#ffcc00";
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number): void {
    g.fillStyle = "#ffcc00";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  isEdible(): boolean {
    return false;
  }
  isPushable(): boolean {
    return false;
  }
  moveHorizontal(dx: number): void {}
}

class Lock2 implements Tile {
  drop(): void {}
  rest(): void {}
  isAir(): boolean {
    return false;
  }
  isPlayer(): boolean {
    return false;
  }
  isFlux(): boolean {
    return false;
  }
  isUnbreakable(): boolean {
    return false;
  }
  isStone(): boolean {
    return false;
  }
  isFallingStone(): boolean {
    return false;
  }
  isBox(): boolean {
    return false;
  }
  isFallingBox(): boolean {
    return false;
  }
  isKey1(): boolean {
    return false;
  }
  isKey2(): boolean {
    return false;
  }
  isLock1(): boolean {
    return false;
  }
  isLock2(): boolean {
    return true;
  }
  color(g: CanvasRenderingContext2D): void {}
  draw(g: CanvasRenderingContext2D, x: number, y: number): void {}
  isEdible(): boolean {
    return false;
  }
  isPushable(): boolean {
    return false;
  }
  moveHorizontal(dx: number): void {}
}

function updateMap() {
  for (let y = map.length - 1; y >= 0; y--) {
    for (let x = 0; x < map[y].length; x++) {
      updateTile(x, y);
    }
  }
}

function updateTile(x: number, y: number) {
  if (
    (map[y][x].isStone() && map[y + 1][x].isAir()) ||
    (map[y][x].isBox() && map[y + 1][x].isAir())
  ) {
    map[y][x].drop();
    map[y + 1][x] = map[y][x];
    map[y][x] = new Air();
  } else if (map[y][x].isFallingStone() || map[y][x].isFallingBox()) {
    map[y][x].rest();
  }
}

function createGraphics() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");

  g.clearRect(0, 0, canvas.width, canvas.height);

  return g;
}

function draw() {
  let g = createGraphics();
  // Draw map
  drawMap(g);
  // Draw player
  drawPlayer(g);
}

function drawMap(g: CanvasRenderingContext2D) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x].draw(g, x, y);
    }
  }
}

function drawPlayer(g: CanvasRenderingContext2D) {
  g.fillStyle = "#ff0000";
  g.fillRect(playerx * TILE_SIZE, playery * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function gameLoop() {
  let before = Date.now();
  update();
  draw();
  let after = Date.now();
  let frameTime = after - before;
  let sleep = SLEEP - frameTime;
  setTimeout(() => gameLoop(), sleep);
}

window.onload = () => {
  transformMap();
  gameLoop();
};

const LEFT_KEY = "ArrowLeft";
const UP_KEY = "ArrowUp";
const RIGHT_KEY = "ArrowRight";
const DOWN_KEY = "ArrowDown";
window.addEventListener("keydown", (e) => {
  if (e.key === LEFT_KEY || e.key === "a") inputs.push(new Left());
  else if (e.key === UP_KEY || e.key === "w") inputs.push(new Up());
  else if (e.key === RIGHT_KEY || e.key === "d") inputs.push(new Right());
  else if (e.key === DOWN_KEY || e.key === "s") inputs.push(new Down());
});
