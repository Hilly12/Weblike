import GameMap from "./GameMap";
import Utils from "./Utils";
import Room from "./Room";
import Coord from "./Coord";

class MapGenerator {
  private readonly width: number;
  private readonly height: number;
  private readonly map: GameMap;
  private readonly rooms: Room[];

  public playerPos: Coord;
  public stairsPos: Coord;

  public constructor() {
    this.width = Utils.get().mapWidth;
    this.height = Utils.get().mapHeight;
    this.map = new GameMap(this.width, this.height);
    this.rooms = [];
    this.playerPos = new Coord(0, 0);
    this.stairsPos = new Coord(0, 0);
  }

  public generateMap(floor: number): GameMap {
    console.log("Generating map for floor " + floor + "...")
    this.placeRooms(floor);
    this.clearRooms();
    this.placePlayerStairs();
    this.removeExcessWalls();
    console.log("Successfully generated map")
    return this.map;
  }

  private placeRooms(floor: number) {
    const minRooms = Math.floor(3.0 + 1.0 + floor / 10.0);
    const maxRooms = Math.floor(4.0 * (1.0 + floor / 40.0));
    const roomCount = Utils.get().getRandom(minRooms, maxRooms);
    console.log("Placing " + roomCount + " rooms...")
    for (let i = 0; i < roomCount; i++) {
      console.log("Placing room " + (i + 1) + "...");
      const w: number = Math.floor(Utils.get().getRandom(5, 20));
      const h: number = Math.floor(Utils.get().getRandom(5, 16));
      const x: number = Math.floor(Utils.get().getRandom(0, this.width - w - 1) + 1);
      const y: number = Math.floor(Utils.get().getRandom(0, this.height - h - 1) + 1);
      const newRoom: Room = new Room(x, y, w, h);
      let failed: boolean = false;
      for (let j = 0; j < this.rooms.length; j++) {
        if (newRoom.intersects(this.rooms[j])) {
          console.log("Failed to find space for room " + (i + 1));
          failed = true;
          i--;
          break;
        }
      }
      if (!failed) {
        console.log("Found space for room " + (i + 1));
        const newCentre: Coord = newRoom.c;
        if (this.rooms.length !== 0) {
          const prevCentre: Coord = this.rooms[this.rooms.length - 1].c;
          console.log("Creating Corridors...");
          if (Math.random() > 0.5) {
            this.hCorridor(prevCentre.x, newCentre.x, prevCentre.y);
            this.vCorridor(prevCentre.y, newCentre.y, newCentre.x);
          } else {
            this.vCorridor(prevCentre.y, newCentre.y, prevCentre.x);
            this.hCorridor(prevCentre.x, newCentre.x, newCentre.y);
          }
          console.log("Connected rooms " + (i + 1) + " and " + i);
        }
        this.rooms.push(newRoom);
        console.log("Placed room " + (i + 1) + " at " + newRoom.c.x + ", " + newRoom.c.y);
      }
    }
    console.log("Successfully placed " + roomCount + " rooms");
  }

  private clearRooms() {
    console.log("Clearing all rooms...");
    for (let i = 0; i < this.rooms.length; i++) {
      const room = this.rooms[i];
      console.log("Clearing room " + (i + 1) + "...")
      for (let x = room.c1.x; x < room.c2.x; x++) {
        for (let y = room.c1.y; y < room.c2.y; y++) {
          this.map.set(x, y, 0);
        }
      }
      console.log("Cleared room " + (i + 1))
    }
    console.log("Successfully cleared all rooms");
  }

  public placePlayerStairs() {
    console.log("Placing Player and Stairs...");
    const playerRoom = this.rooms[Math.floor(Math.random() * this.rooms.length)];
    this.playerPos = playerRoom.c;
    console.log("Placed Player at " + this.playerPos.x + ", " + this.playerPos.y);

    const stairsRoom = this.rooms[Math.floor(Math.random() * this.rooms.length)];
    const tiles = stairsRoom.getInteriorTiles();
    this.stairsPos = tiles[Math.floor(Math.random() * tiles.length)];
    console.log("Placed Stairs at " + this.stairsPos.x + ", " + this.stairsPos.y);
  }

  public removeExcessWalls() {
    console.log("Removing Outer Walls...");
    for (let x = 0; x < 128; x++) {
      for (let y = 0; y < 72; y++) {
        if (this.map.get(x, y) === 1 &&
          this.getSurroundingFloorTiles(x, y) === 0)
          this.map.set(x, y, -1);
      }
    }
    console.log("All outer walls removed");
  }

  public getSpawnPoint(): Coord {
    const room = this.rooms[Math.floor(Math.random() * this.rooms.length)];
    const tiles = room.getTiles();
    return tiles[Math.floor(Math.random() * tiles.length)];
  }

  public getUnseenSpawnPoint(currentPlayerPos: Coord): Coord {
    let pos = currentPlayerPos;
    while (pos.isVisible(currentPlayerPos)) {
      const room = this.rooms[Math.floor(Math.random() * this.rooms.length)]
      const tiles = room.getTiles();
      pos = tiles[Math.floor(Math.random() * tiles.length)];
    }
    return pos;
  }

  private hCorridor(x1: number, x2: number, y: number) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      this.map.set(x, y, 0);
    }
  }

  private vCorridor(y1: number, y2: number, x: number) {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      this.map.set(x, y, 0);
    }
  }

  public roomCount(): number {
    return this.rooms.length;
  }

  public getSurroundingFloorTiles(hPos: number, vPos: number): number {
    let count = 0;
    for (let y = vPos - 1; y <= vPos + 1; y++) {
      for (let x = hPos - 1; x <= hPos + 1; x++) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height &&
          this.map.get(x, y) === 0)
          count++;
      }
    }
    return count;
  }

}

export default MapGenerator;