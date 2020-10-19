import Coord from "../Coord";
import Direction from "../Direction";
import Utils from "../Utils";
import LivingEntity from "./LivingEntity";

class Player extends LivingEntity {
  private luck: number;
  private maxxp: number;
  private xp: number;
  private sp: number;
  private belly: number;

  public constructor(pos: Coord, maxhp: number, atk: number, def: number, luck: number, lvl: number, xp: number, sp: number, belly: number, dir: Direction) {
    super(pos, maxhp, atk, def, lvl, dir);
    this.luck = luck;
    this.maxxp = Utils.get().getMaxXP(lvl);
    this.xp = xp;
    this.sp = sp;
    this.belly = belly;
  }

  public getLuck(): number {
    return this.luck;
  }

  public getStage(): number {
    if (this.lvl >= 50)
      return 2;
    if (this.lvl >= 20)
      return 1;
    return 0;
  }

  public getMaxXP(): number {
    return this.maxxp;
  }

  public getXP(): number {
    return this.xp;
  }

  public getSP(): number {
    return this.sp;
  }

  public getBelly(): number {
    return this.belly;
  }

  public lvlUp() {
    super.lvlUp();
    if (this.lvl === 50) {
      this.sp += 10;
      this.maxhp += 200;
    } else if (this.lvl === 20) {
      this.sp += 5;
      this.maxhp += 100;
    } else {
      this.sp += 2;
    }
    this.maxhp += 4;
    this.hp = this.maxhp;
    this.xp -= this.maxxp;
    this.maxxp = Utils.get().getMaxXP(this.lvl);
  }

  public alterStats(a: number, d: number, l: number) {
    this.atk += a;
    this.def += d;
    this.luck += l;
  }

  public increaseXP(received: number) {
    if (this.lvl === 60 && this.xp >= this.maxxp) {
      this.xp = this.maxxp;
      return;
    }
    this.xp += received;
    while (this.xp >= this.maxxp)
      this.lvlUp();
  }

  public decrementSP() {
    this.sp--;
  }

  public replenishBelly() {
    const bellyReplenishment = Utils.get().bellyReplenishment;
    const bellyDisplayFactor = Utils.get().bellyDisplayFactor;
    const bellyFull = Utils.get().bellyFull;
    this.belly += bellyReplenishment;
    if (this.belly > bellyFull) {
      this.belly = bellyFull;
      this.hp = Math.min(Math.floor(this.hp + bellyReplenishment / bellyDisplayFactor), this.maxhp);
    }
  }

  public fillBelly() {
    this.belly = Utils.get().bellyFull;
  }

  public endTurn() {
    super.endTurn();
    if (this.belly > 0) {
      if (this.hp < this.maxhp && this.moving)
        this.hp++;
      this.belly--;
    } else {
      this.hp--;
    }
  }

  public damage(enAttack: number) {
    super.damage(Math.floor(enAttack * enAttack * enAttack / this.def * this.def));
  }
}

export default Player;