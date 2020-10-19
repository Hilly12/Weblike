import Direction from "./Direction";
import GameMap from "./GameMap";
import Wall from "./entities/Wall";
import Coord from "./Coord";

class Utils {
  private static instance: Utils;

  public readonly mapWidth: number;
  public readonly mapHeight: number;
  public readonly visibleMapWidth: number;
  public readonly visibleMapHeight: number;

  public readonly bellyFull: number;
  public readonly bellyReplenishment: number;
  public readonly bellyDisplayFactor: number;

  public readonly foodPerRoom : number;

  private constructor() {
    this.mapWidth = 128;
    this.mapHeight = 72;
    this.visibleMapWidth = 16;
    this.visibleMapHeight = 9;

    this.bellyFull = 1000;
    this.bellyReplenishment = 50;
    this.bellyDisplayFactor = 10.0;

    this.foodPerRoom = 3;
  }

  public static get(): Utils {
    if (!Utils.instance) {
      Utils.instance = new Utils();
    }

    return Utils.instance;
  }

  public getRandom(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  public getMaxXP(lvl: number): number {
    return Math.floor(200.0 * Math.pow(2.0, (lvl - 1) * 0.25));
  }

  public getRandomDirection(): Direction {
    const rand  = Math.random();
    if (rand < 0.25) {
      return Direction.LEFT;
    } else if (rand < 0.5) {
      return Direction.RIGHT;
    } else if (rand < 0.75) {
      return Direction.UP;
    } else {
      return Direction.DOWN;
    }
  }

  public ComputeSquareSize(appW : number, appH: number) : number {
    let sq = Math.max(appW / this.visibleMapWidth, appH / this.visibleMapHeight);
    sq = Math.round(sq / 10.0) * 10;
    return sq;
  }

  public CreateWalls(map: GameMap) : Wall[] {
    const walls : Wall[] = []
    for (let x = 0; x < map.width; x++) {
      for (let y = 0; y < map.height; y++) {
        if (map.board[x][y] === 1) {
          const directNeighbours = this.getDirectNeighbouringTilesPositionSum(map, x, y);
          let orientation = 0;
          switch (directNeighbours) {
            case 1:
              orientation = 12;
              break;
            case 2:
              orientation = 14;
              break;
            case 3:
              orientation = 3;
              break;
            case 4:
              orientation = 15;
              break;
            case 5:
              orientation = 4;
              break;
            case 6:
              orientation = 2;
              break;
            case 7:
              orientation = 7;
              break;
            case 8:
              orientation = 13;
              break;
            case 9:
              orientation = 1;
              break;
            case 10:
              orientation = 5;
              break;
            case 11:
              orientation = 9;
              break;
            case 12:
              orientation = 6;
              break;
            case 13:
              orientation = 10;
              break;
            case 14:
              orientation = 8;
              break;
            case 15:
              orientation = 11;
              break;
          }
          walls.push(new Wall(new Coord(x, y), orientation));
        }
      }
    }
    return walls;
  }

  public getDirectNeighbouringTilesPositionSum(map : GameMap, hPos : number, vPos : number) {
    let sum = 0;

    let x = hPos;
    let y = vPos - 1;
    if (this.isInMapRange(map, x, y) && map.board[x][y] === 1)
      sum += 8;

    x = hPos - 1;
    y = vPos;
    if (this.isInMapRange(map, x, y) && map.board[x][y] === 1)
      sum += 4;

    x = hPos + 1;
    y = vPos;
    if (this.isInMapRange(map, x, y) && map.board[x][y] === 1)
      sum += 2;

    x = hPos;
    y = vPos + 1;
    if (this.isInMapRange(map, x, y) && map.board[x][y] === 1)
      sum++;

    return sum;
}

  public isInMapRange(map: GameMap, x : number, y : number) : boolean {
    return (x >= 0 && x < map.width && y >= 0 && y < map.height);
  }

  public contains<T>(list : T[], item : T) : boolean {
    for (let i = 0; i < list.length; i++) {
      if (list[i] === item) {
        return true;
      }
    }
    return false;
  }


  public someBusinessLogic() {
    // ...
  }
}

export default Utils;