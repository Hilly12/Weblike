import Entity from "./Entity";
import Coord from "../Coord";
import Direction from "../Direction";
import Utils from "../Utils";

abstract class LivingEntity extends Entity {
  protected maxhp: number;
  protected atk: number;
  protected def: number;
  protected lvl: number;
  protected hp: number;
  protected dir: Direction;
  protected moving: boolean;
  protected attacking: boolean;

  protected constructor(pos : Coord, maxhp: number, atk: number, def: number, lvl: number, dir: Direction) {
    super(pos);
    this.maxhp = maxhp;
    this.atk = atk;
    this.def = def;
    this.lvl = lvl;
    this.hp = maxhp;
    this.dir = dir;
    this.moving = false;
    this.attacking = false;
  }

  public getMaxHP(): number {
    return this.maxhp;
  }

  public getAttack(): number {
    return this.atk;
  }

  public getDefence(): number {
    return this.def;
  }

  public getLevel(): number {
    return this.lvl;
  }

  public getHP(): number {
    return this.hp;
  }

  public getDirection(): Direction {
    return this.dir;
  }

  public isMoving(): boolean {
    return this.moving;
  }

  public isAttacking(): boolean {
    return this.attacking;
  }

  public setMoving(moving : boolean) {
    this.moving = moving;
  }

  public setAttacking(attacking : boolean) {
    this.attacking = attacking;
  }

  public getNewPos(): Coord {
    if (this.dir === Direction.LEFT)
      return this.pos.left();
    if (this.dir === Direction.RIGHT)
      return this.pos.right();
    if (this.dir === Direction.UP)
      return this.pos.up();
    return this.pos.down();
  }

  public lvlUp() {
    this.lvl++;
  }

  public face(dir: Direction) {
    this.dir = dir;
  }

  public resetDirection() {
    this.dir = Utils.get().getRandomDirection();
  }

  public endTurn() {
    if (this.moving) {
      if (this.dir === Direction.LEFT) {
        this.pos.x--;
      } else if (this.dir === Direction.RIGHT) {
        this.pos.x++;
      } else if (this.dir === Direction.UP) {
        this.pos.y--;
      } else if (this.dir === Direction.DOWN) {
        this.pos.y++;
      }
    }
    this.moving = false;
    this.attacking = false;
  }

  public damage(dmg: number) {
    this.hp -= dmg;
  }
}

export default LivingEntity;