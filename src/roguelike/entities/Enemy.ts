import Coord from "../Coord";
import Direction from "../Direction";
import LivingEntity from "./LivingEntity";
import GameMap from "../GameMap";
import Utils from "../Utils";

class Enemy extends LivingEntity {
  private readonly range: number;
  private readonly accuracy: number;
  private readonly lineOfSight: number;
  public readonly enemyType: number;

  private verticalDirection: Direction;

  public constructor(pos: Coord, lvl: number, enemyType: number, dir: Direction) {
    super(pos, Math.floor(Math.exp(0.45 * lvl) * 10), Math.floor((Math.exp(0.2 * lvl) * 10)), 0, lvl, dir);
    this.lineOfSight = 5 + lvl;
    this.range = 3;
    this.accuracy = 0.8 + lvl * 0.02;
    this.enemyType = enemyType;
    this.verticalDirection = (dir === Direction.LEFT || dir === Direction.RIGHT) ? dir : (Math.random() > 0.5 ? Direction.LEFT : Direction.RIGHT);
  }

  public makeMove(map: GameMap, playerPos: Coord, newPlayerPos: Coord, playerDirection: Direction, playerMoving: boolean) {
    const distSq = Coord.distanceSquared(playerPos, this.pos);
    const validMoves = []
    if (map.board[this.pos.x - 1][this.pos.y] === 0)
      validMoves.push(Direction.LEFT);
    if (map.board[this.pos.x + 1][this.pos.y] === 0)
      validMoves.push(Direction.RIGHT);
    if (map.board[this.pos.x][this.pos.y - 1] === 0)
      validMoves.push(Direction.UP);
    if (map.board[this.pos.x][this.pos.y + 1] === 0)
      validMoves.push(Direction.DOWN);
    if (distSq <= this.lineOfSight * this.lineOfSight) {
      if (playerMoving) {
        if (Coord.areAdjacent(playerPos, this.pos)) {
          if (Utils.get().contains<Direction>(validMoves, playerDirection)) {
            this.move(playerDirection);
          } else if (playerPos.x < this.pos.x && Utils.get().contains<Direction>(validMoves, Direction.LEFT)) {
            this.move(Direction.LEFT);
          } else if (playerPos.x > this.pos.x && Utils.get().contains<Direction>(validMoves, Direction.RIGHT)) {
            this.move(Direction.RIGHT);
          } else if (playerPos.y < this.pos.y && Utils.get().contains<Direction>(validMoves, Direction.UP)) {
            this.move(Direction.UP);
          } else if (playerPos.y > this.pos.y && Utils.get().contains<Direction>(validMoves, Direction.DOWN)) {
            this.move(Direction.DOWN);
          }
        } else if (!Coord.areAdjacent(newPlayerPos, this.pos)) {
          this.moveToward(newPlayerPos, Coord.distanceSquared(newPlayerPos, this.pos), validMoves);
        }
      } else if (Coord.areAdjacent(playerPos, this.pos)) {
        if (playerPos.x < this.pos.x) {
          this.dir = Direction.LEFT;
        } else if (playerPos.x > this.pos.x) {
          this.dir = Direction.RIGHT;
        } else if (playerPos.y < this.pos.y) {
          this.dir = Direction.UP;
        } else {
          this.dir = Direction.DOWN;
        }
        this.attacking = true;
      } else {
        this.moveToward(playerPos, distSq, validMoves);
      }
    } else if (validMoves.length > 0) {
      this.move(validMoves[Math.round(Math.random() * validMoves.length)]);
    }
  }

  public moveToward(target: Coord, distSq: number, validMoves: Direction[]) {
    let index = -1;
    let min = distSq;
    for (let i = 0; i < validMoves.length; i++) {
      this.dir = validMoves[i];
      const newDistSq = Coord.distanceSquared(target, this.getNewPos());
      if (newDistSq < min) {
        index = i;
        min = newDistSq;
      }
    }
    if (index !== -1)
      this.move(validMoves[index]);
  }

  public move(d: Direction) {
    this.dir = d;
    this.moving = true;
  }

  public face(dir: Direction) {
    super.face(dir);
    if (dir === Direction.LEFT || dir === Direction.RIGHT)
      this.verticalDirection = dir;
  }

  public getVerticalDirection(): Direction {
    return this.verticalDirection;
  }

  public getXP() {
    return 50 + Math.round(Math.exp((this.lvl + Math.random()) * 1.3) * 10.0);
  }

  public computeAttack(luck: number): number {
    return (Math.random() <= this.accuracy * (1.0 - (luck / 200.0))) ? (this.atk + Math.round((Math.random() - 0.5) * this.range)) : 0;
  }
}

export default Enemy;