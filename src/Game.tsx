import React, {Component} from 'react';
import Canvas from "./Canvas";
import MapGenerator from "./roguelike/MapGenerator";
import GameMap from "./roguelike/GameMap";
import Coord from "./roguelike/Coord";
import Player from "./roguelike/entities/Player";
import Utils from "./roguelike/Utils";
import Direction from "./roguelike/Direction";
import Enemy from "./roguelike/entities/Enemy";
import Wall from "./roguelike/entities/Wall";
import Food from "./roguelike/entities/Food";
import flr from "./assets/floor.png"
import wls from "./assets/walls.png"
import fd from "./assets/food.png"
import str from "./assets/stairs.png"
import pl1 from "./assets/playerSheet1.png"
import pl2 from "./assets/playerSheet2.png"
import pl3 from "./assets/playerSheet3.png"
import en1 from "./assets/enemy0.png"
import en2 from "./assets/enemy1.png"


class Game extends Component {
  private appW: number;
  private appH: number;
  private squareSize: number;
  private floor: number;
  private maxFloor: number;
  private mapGenerator: MapGenerator;
  private map: GameMap;
  private player: Player;
  private stairsPos: Coord;
  private walls: Wall[];
  private enemyCount: number;
  private enemies: Enemy[];
  private foodCount: number;
  private food: Food[];
  private seenTiles: Coord[];

  private leftDown: boolean;
  private rightDown: boolean;
  private upDown: boolean;
  private downDown: boolean;
  private spaceDown: boolean;
  private movementShift: number;
  private animating: boolean;
  private steps: number;
  private attacking: boolean;
  private gameOver: boolean;
  private frameCount: number;

  private readonly floorImg: HTMLImageElement;
  private readonly wallImg: HTMLImageElement;
  private readonly foodImg: HTMLImageElement;
  private readonly stairsImg: HTMLImageElement;
  private readonly playerImg1: HTMLImageElement;
  private readonly playerImg2: HTMLImageElement;
  private readonly playerImg3: HTMLImageElement;
  private readonly enemyImg1: HTMLImageElement;
  private readonly enemyImg2: HTMLImageElement;

  // private int backgroundClipCount;

  constructor(props: any) {
    super(props);

    this.update = this.update.bind(this);
    this.paint = this.paint.bind(this);
    this.drawFloor = this.drawFloor.bind(this);
    this.drawFood = this.drawFood.bind(this);

    this.leftDown = this.rightDown = this.upDown = this.downDown = this.spaceDown = false;
    this.movementShift = 0;
    this.animating = false;
    this.steps = 0;
    this.attacking = false;
    this.gameOver = false;

    this.walls = [];
    this.enemyCount = 0;
    this.enemies = [];
    this.foodCount = 0;
    this.food = [];
    this.seenTiles = [];

    this.frameCount = 0;
    this.appW = window.innerWidth;
    this.appH = window.innerHeight;
    this.squareSize = Utils.get().ComputeSquareSize(this.appW, this.appH);

    this.floorImg = new Image();
    this.floorImg.src = flr;
    this.wallImg = new Image();
    this.wallImg.src = wls;
    this.foodImg = new Image();
    this.foodImg.src = fd;
    this.stairsImg = new Image();
    this.stairsImg.src = str;
    this.playerImg1 = new Image();
    this.playerImg1.src = pl1;
    this.playerImg2 = new Image();
    this.playerImg2.src = pl2;
    this.playerImg3 = new Image();
    this.playerImg3.src = pl3;
    this.enemyImg1 = new Image();
    this.enemyImg1.src = en1;
    this.enemyImg2 = new Image();
    this.enemyImg2.src = en2;

    this.mapGenerator = new MapGenerator();
    if (props.checkpoint) {
      // TODO: load save
      this.floor = 0;
      this.maxFloor = 0;
      this.map = this.mapGenerator.generateMap(this.floor);
      this.player = new Player(this.mapGenerator.playerPos, 0, 0, 0, 0, 0, 0, 0, 0, Utils.get().getRandomDirection());
      this.stairsPos = this.mapGenerator.stairsPos;
    } else {
      this.floor = 1;
      this.maxFloor = 1;
      this.map = this.mapGenerator.generateMap(this.floor);
      this.player = new Player(this.mapGenerator.playerPos, 100, 3, 3, 3, 1, 0, 3, 1000, Utils.get().getRandomDirection());
      this.stairsPos = this.mapGenerator.stairsPos;
    }

    this.loadFloor();
  }

  public loadFloor() {
    this.leftDown = this.rightDown = this.upDown = this.downDown = this.spaceDown = false;
    this.movementShift = 0;
    this.animating = false;
    this.steps = 0;
    this.attacking = false;
    this.gameOver = false;

    this.walls = Utils.get().CreateWalls(this.map);
    this.seenTiles = [];
    this.stairsPos = this.mapGenerator.stairsPos;
    if (this.floor < this.maxFloor)
      this.seenTiles.push(this.stairsPos);

    this.enemies = [];
    this.enemyCount = 5 + Math.round(this.floor / 5);
    while (this.enemies.length < this.enemyCount)
      this.generateEnemy();

    this.food = []
    this.foodCount = this.mapGenerator.roomCount();
    while (this.food.length < this.foodCount)
      this.placeFood();
  }

  componentDidMount() {
    document.onkeydown = this.onKeyDown;
    document.onkeyup = this.onKeyUp;
  }

  componentWillUnmount() {
    document.onkeydown = null;
    document.onkeyup = null;
  }

  update() {
    if (!this.animating) {
      if (this.leftDown) {
        this.player.face(Direction.LEFT);
        if (this.map.get(this.player.getPos().x - 1, this.player.getPos().y) === 0)
          this.player.setMoving(true);
      } else if (this.rightDown) {
        this.player.face(Direction.RIGHT);
        if (this.map.get(this.player.getPos().x + 1, this.player.getPos().y) === 0)
          this.player.setMoving(true);
      } else if (this.upDown) {
        this.player.face(Direction.UP);
        if (this.map.get(this.player.getPos().x, this.player.getPos().y - 1) === 0)
          this.player.setMoving(true);
      } else if (this.downDown) {
        this.player.face(Direction.DOWN);
        if (this.map.get(this.player.getPos().x, this.player.getPos().y + 1) === 0)
          this.player.setMoving(true);
      } else if (this.spaceDown && !this.player.isAttacking()) {
        this.player.setAttacking(true);
      }
      if (this.player.isMoving() || this.player.isAttacking()) {
        this.enemies.forEach(en => {
          en.makeMove(this.map, this.player.getPos(), this.player.getNewPos(), this.player.getDirection(), this.player.isMoving());
          if (en.isMoving()) {
            this.map.set(en.getPos().x, en.getPos().y, 0);
            this.map.set(en.getNewPos().x, en.getNewPos().y, 2);
          }
          if (en.isAttacking())
            this.attacking = true;
        });
        this.animating = true;
      }
    } else {
      if (this.player.isAttacking()) {
        this.steps = this.steps + 1;
        if (this.steps >= 4) {
          const target = this.enemies.filter(en => en.getPos().equals(this.player.getNewPos()));
          if (target.length > 0) {
            // ResourceManager.playerAtkClip.start(); TODO: audio
          }
        }
        if (this.steps >= 8) {
          this.player.setAttacking(false);
          const target = this.enemies.filter(en => en.getPos().equals(this.player.getNewPos()));
          if (target.length > 0) {
            const victim = target[0];
            // ResourceManager.playerAtkClip.stop(); TODO: audio
            // ResourceManager.playerAtkClip.setFramePosition(0);
            victim.damage(this.player.getAttack());
            if (victim.getHP() <= 0) {
              this.map.set(victim.getPos().x, victim.getPos().y, 0);
              this.player.increaseXP(victim.getXP());
              this.enemies = this.enemies.filter(en => !en.getPos().equals(this.player.getNewPos()));
            }
          }
          this.steps = 0;
        }
      } else if (this.attacking) {
        this.steps = this.steps + 1;
        if (this.steps >= 8) {
          // ResourceManager.enemyAtkClip.start(); TODO: audio
        }
        if (this.steps >= 8) {
          // ResourceManager.enemyAtkClip.stop(); TODO: audio
          // ResourceManager.playerAtkClip.setFramePosition(0);
          this.enemies.forEach(en => {
            en.setAttacking(false);
            if (this.player.getPos().equals(en.getNewPos()))
              this.player.damage(en.computeAttack(this.player.getLuck()));
          });
          this.attacking = false;
          this.steps = 0;
        }
      } else {
        this.steps = this.steps + 1;
        if (this.steps >= 8) {
          this.animating = false;
          this.player.endTurn();
          const target = this.food.filter(f => f.getPos().equals(this.player.getPos()));
          if (target.length > 0) {
            this.food = this.food.filter(f => !f.getPos().equals(this.player.getPos()));
            // ResourceManager.munchClip.setFramePosition(0); TODO: audio
            // ResourceManager.munchClip.start();
            this.player.replenishBelly();
          }
          this.enemies.forEach(en => {
            en.endTurn();
          });
          this.steps = 0;
        }
      }
      this.movementShift = this.squareSize * this.steps / 8;
    }
    if (this.player.getHP() <= 0) {
      // Stop and save game
      // this.saveGame();
      this.gameOver = true;
    }
    this.walls
      .filter(w => w.getPos().isVisible(this.player.getPos()) && !w.getPos().isIn(this.seenTiles))
      .forEach(w => {
        this.seenTiles.push(w.getPos());
      });
    if (this.stairsPos.isVisible(this.player.getPos()) && !this.stairsPos.isIn(this.seenTiles))
      this.seenTiles.push(this.stairsPos);
    while (this.enemies.length < this.enemyCount)
      this.generateEnemy();
    // if (this.topBarInitialized)
    //   Board.this.updateTopBar();
    this.frameCount++;
    if (this.frameCount >= 1000000)
      this.frameCount = 0;
    // if (!ResourceManager.backgroundClips[Board.this.backgroundClipCount].isRunning()) {
    //   Board.this.backgroundClipCount = Board.this.backgroundClipCount + 1;
    //   if (Board.this.backgroundClipCount == 3)
    //     Board.this.backgroundClipCount = 0;
    //   ResourceManager.backgroundClips[Board.this.backgroundClipCount].setFramePosition(0);
    //   ResourceManager.backgroundClips[Board.this.backgroundClipCount].start();
    // } TODO: audio
  }

  paint(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, this.appW, this.appH);
    ctx.imageSmoothingEnabled = false;
    for (let x = -1; x < 17; x++) {
      for (let y = -1; y < 10; y++) {
        const hPos = x + this.player.getPos().x - Math.floor(Utils.get().visibleMapWidth / 2);
        const vPos = y + this.player.getPos().y - Math.floor(Utils.get().visibleMapHeight / 2);
        if (Utils.get().isInMapRange(this.map, hPos, vPos) && (this.map.get(hPos, vPos) === 0 || this.map.get(hPos, vPos) === 2)) {
          let X = x * this.squareSize;
          let Y = y * this.squareSize;
          if (this.player.isMoving()) {
            if (this.player.getDirection() === Direction.LEFT) {
              X += this.movementShift;
            } else if (this.player.getDirection() === Direction.RIGHT) {
              X -= this.movementShift;
            } else if (this.player.getDirection() === Direction.UP) {
              Y += this.movementShift;
            } else if (this.player.getDirection() === Direction.DOWN) {
              Y -= this.movementShift;
            }
          }
          this.drawFloor(ctx, X, Y, this.squareSize);
        }
      }
    }
    this.food.forEach(f => {
      let rpos = f.getPos().getRelativePos(this.player.getPos());
      if (-1 <= rpos.x && rpos.x < 17 && -1 <= rpos.y && rpos.y < 10) {
        let X = rpos.x * this.squareSize;
        let Y = rpos.y * this.squareSize;
        if (this.player.isMoving())
          if (this.player.getDirection() === Direction.LEFT) {
            X += this.movementShift;
          } else if (this.player.getDirection() === Direction.RIGHT) {
            X -= this.movementShift;
          } else if (this.player.getDirection() === Direction.UP) {
            Y += this.movementShift;
          } else if (this.player.getDirection() === Direction.DOWN) {
            Y -= this.movementShift;
          }
        this.drawFood(ctx, X, Y, this.squareSize, f.ref);
      }
    });
    this.walls.forEach(w => {
      if (w.getPos().isVisible(this.player.getPos())) {
        let rpos = w.getPos().getRelativePos(this.player.getPos());
        let X = rpos.x * this.squareSize;
        let Y = rpos.y * this.squareSize;
        if (this.player.isMoving())
          if (this.player.getDirection() === Direction.LEFT) {
            X += this.movementShift;
          } else if (this.player.getDirection() === Direction.RIGHT) {
            X -= this.movementShift;
          } else if (this.player.getDirection() === Direction.UP) {
            Y += this.movementShift;
          } else if (this.player.getDirection() === Direction.DOWN) {
            Y -= this.movementShift;
          }
        this.drawWall(ctx, X, Y, this.squareSize, w.orientation);
      }
    });
    this.drawStairs(ctx, this.squareSize);
    this.enemies.forEach(en => {
      if (en.getPos().isVisible(this.player.getPos())) {
        const rpos = en.getPos().getRelativePos(this.player.getPos());
        let X = rpos.x * this.squareSize;
        let Y = rpos.y * this.squareSize;
        if (this.player.isMoving())
          if (this.player.getDirection() === Direction.LEFT) {
            X += this.movementShift;
          } else if (this.player.getDirection() === Direction.RIGHT) {
            X -= this.movementShift;
          } else if (this.player.getDirection() === Direction.UP) {
            Y += this.movementShift;
          } else if (this.player.getDirection() === Direction.DOWN) {
            Y -= this.movementShift;
          }
        if (en.isMoving() && !this.attacking && !this.player.isAttacking())
          if (en.getDirection() === Direction.LEFT) {
            X -= this.movementShift;
          } else if (en.getDirection() === Direction.RIGHT) {
            X += this.movementShift;
          } else if (en.getDirection() === Direction.UP) {
            Y -= this.movementShift;
          } else if (en.getDirection() === Direction.DOWN) {
            Y += this.movementShift;
          }
        const atkShift = this.squareSize * 0.75 * (1.0 - (this.steps / 8.0));
        if (en.isAttacking() && !this.player.isAttacking() && !this.player.isMoving())
          if (en.getDirection() === Direction.LEFT) {
            X -= atkShift;
          } else if (en.getDirection() === Direction.RIGHT) {
            X += atkShift;
          } else if (en.getDirection() === Direction.UP) {
            Y -= atkShift;
          } else if (en.getDirection() === Direction.DOWN) {
            Y += atkShift;
          }
        this.drawEnemy(ctx, X, Y, this.squareSize, en);
      }
    });
    this.drawPlayer(ctx, this.squareSize);

    this.drawMinimap(ctx);
  }

  public drawMinimap(ctx: CanvasRenderingContext2D) {
    const X = this.appW - 256;
    let Y = this.squareSize / 3;
    this.seenTiles.forEach(c => {
      if (c.equals(this.stairsPos)) {
        ctx.fillStyle = "#0000ff";
        ctx.fillRect(X + c.x * 2 - 1, Y + c.y * 2 - 1, 4, 4);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(X + c.x * 2, Y + c.y * 2, 2, 2);
      }
    });
    ctx.fillStyle = "#ff0000";
    this.enemies.forEach(en => {
      if (en.getPos().isVisible(this.player.getPos()))
        ctx.fillRect(X + (en.getPos()).x * 2 - 1, Y + (en.getPos()).y * 2 - 1, 4, 4);
    });
    ctx.fillStyle = "#ffff00"
    ctx.fillRect(X + (this.player.getPos()).x * 2 - 1, Y + (this.player.getPos()).y * 2 - 1, 4, 4);

    Y = 300 + this.squareSize / 3;
    for (let x = 0; x < this.map.width; x++) {
      for (let y = 0; y < this.map.height; y++) {
        switch(this.map.get(x, y)) {
          case 1:
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(X + x * 2, Y + y * 2, 2, 2);
            break;
          case 2:
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(X + x * 2, Y + y * 2, 2, 2);
            break;
          default:
            break;
        }
        if (this.player.getPos().equals(new Coord(x, y))) {
          ctx.fillStyle = "#ffff00";
          ctx.fillRect(X + x * 2, Y + y * 2, 2, 2);
        }
      }
    }
  }

  public drawFloor(ctx: CanvasRenderingContext2D, x: number, y: number, sq: number) {
    ctx.drawImage(this.floorImg, x, y, sq, sq);
  }

  public drawFood(ctx: CanvasRenderingContext2D, x: number, y: number, sq: number, ref: number) {
    const index = ref % 32;
    ctx.drawImage(this.foodImg, (index % 8) * 16, Math.floor(index / 4) * 16, 16, 16, x, y, sq, sq);
  }

  public drawWall(ctx: CanvasRenderingContext2D, x: number, y: number, sq: number, orientation: number) {
    ctx.drawImage(this.wallImg, orientation * 16, 0, 16, 16, x, y, sq, sq);
  }

  public drawStairs(ctx: CanvasRenderingContext2D, sq: number) {
    const rpos = this.stairsPos.getRelativePos(this.player.getPos());
    let X = rpos.x * sq;
    let Y = rpos.y * sq;
    if (this.player.isMoving()) {
      if (this.player.getDirection() === Direction.LEFT) {
        X += this.movementShift;
      } else if (this.player.getDirection() === Direction.RIGHT) {
        X -= this.movementShift;
      } else if (this.player.getDirection() === Direction.UP) {
        Y += this.movementShift;
      } else if (this.player.getDirection() === Direction.DOWN) {
        Y -= this.movementShift;
      }
    }
    ctx.drawImage(this.stairsImg, X, Y, sq, sq);
  }

  public drawEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, sq: number, en: Enemy) {
    const sx = en.getLevel();
    const sy = en.enemyType;
    const frame = Math.floor(this.frameCount / 15) % 2
    // if (en.getDirection() === Direction.RIGHT)
    //   ctx.scale(-1, 1);
    if (frame === 0)
      ctx.drawImage(this.enemyImg1, sx * 16, sy * 16, 16, 16, x, y, sq, sq);
    else
      ctx.drawImage(this.enemyImg2, sx * 16, sy * 16, 16, 16, x, y, sq, sq);
    // if (en.getDirection() === Direction.RIGHT)
    //   ctx.restore();
  }

  public drawPlayer(ctx: CanvasRenderingContext2D, sq: number) {
    const stage = this.player.getStage();
    const sx = Math.floor(this.frameCount / 15) % 4;
    let sy = 0;
    if (this.player.getDirection() === Direction.LEFT)
      sy = 1;
    else if (this.player.getDirection() === Direction.RIGHT)
      sy = 2;
    else if (this.player.getDirection() === Direction.UP)
      sy = 3;
    let X = Math.floor(Utils.get().visibleMapWidth / 2) * sq;
    let Y = Math.floor(Utils.get().visibleMapHeight / 2) * sq;
    const shift = this.squareSize * 0.75 * (1.0 - (this.steps / 8.0));
    if (this.attacking)
      if (this.player.getDirection() === Direction.LEFT) {
        X -= shift;
      } else if (this.player.getDirection() === Direction.RIGHT) {
        X += shift;
      } else if (this.player.getDirection() === Direction.UP) {
        Y -= shift;
      } else if (this.player.getDirection() === Direction.DOWN) {
        Y += shift;
      }
    if (stage === 0)
      ctx.drawImage(this.playerImg1, sx * 16, sy * 16, 16, 16, X, Y, sq, sq);
    else
      ctx.drawImage(this.playerImg2, sx * 16, sy * 16, 16, 16, X, Y, sq, sq);
    // if (en.getDirection() === Direction.RIGHT)
    //   ctx.restore();
  }

  render() {
    return (
      <Canvas refreshRate={20} update={this.update} paint={this.paint}/>
    );
  }

  public generateEnemy() {
    let newPos = this.mapGenerator.getUnseenSpawnPoint(this.player.getPos());
    while (this.map.get(newPos.x, newPos.y) !== 0)
      newPos = this.mapGenerator.getUnseenSpawnPoint(this.player.getPos());
    const mean = this.floor / 14;
    let lvl = -1;
    while (lvl < 0 || lvl > 7)
      lvl = Math.round(mean + (Math.random() * 2 - 1) * (Math.random() * 2 - 1) * 1.5);
    const en = new Enemy(newPos, lvl, Math.round(Math.random() * 8), Utils.get().getRandomDirection());
    this.enemies.push(en);
    this.map.set(newPos.x, newPos.y, 2);
  }

  public placeFood() {
    let newPos;
    while (true) {
      const pos = this.mapGenerator.getSpawnPoint();
      if (this.map.get(pos.x, pos.y) === 0 && this.food.filter(f => f.getPos().equals(pos)).length === 0) {
        newPos = pos;
        break;
      }
    }
    const f = new Food(newPos);
    this.food.push(f);
  }

  onKeyDown = (e: KeyboardEvent) => {
    e = e || window["event"];
    if (e.code === "ArrowLeft") {
      this.leftDown = true;
    }
    if (e.code === "ArrowRight") {
      this.rightDown = true;
    }
    if (e.code === "ArrowUp") {
      this.upDown = true;
    }
    if (e.code === "ArrowDown") {
      this.downDown = true;
    }
    if (e.code === "Space") {
      console.log(this.map);
      this.spaceDown = true;
    }
  }

  onKeyUp = (e: KeyboardEvent) => {
    e = e || window["event"];
    if (e.code === "ArrowLeft") {
      this.leftDown = false;
    }
    if (e.code === "ArrowRight") {
      this.rightDown = false;
    }
    if (e.code === "ArrowUp") {
      this.upDown = false;
    }
    if (e.code === "ArrowDown") {
      this.downDown = false;
    }
    if (e.code === "Space") {
      this.spaceDown = false;
    }
  }
}

export default Game;