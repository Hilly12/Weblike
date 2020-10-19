import Coord from "./Coord";

class Room {
    public readonly width: number;
    public readonly height: number;
    public readonly c1: Coord;
    public readonly c2: Coord;
    public readonly c: Coord;

    public constructor(x: number, y: number, w: number, h: number) {
        this.width = w;
        this.height = h;
        this.c1 = new Coord(x, y);
        this.c2 = new Coord(x + w, y + h);
        this.c = new Coord(Math.floor(((this.c1.x + this.c2.x) / 2)), Math.floor(((this.c1.y + this.c2.y) / 2)));
    }

    public getTiles(): Coord[] {
        const tiles: Coord[] = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++)
                tiles.push(new Coord(this.c1.x + x, this.c1.y + y));
        }
        return tiles;
    }

    public getInteriorTiles(): Coord[] {
        const tiles: Coord[] = [];
        for (let x = 1; x < this.width - 1; x++) {
            for (let y = 1; y < this.height - 1; y++)
                tiles.push(new Coord(this.c1.x + x, this.c1.y + y));
        }
        return tiles;
    }

    public intersects(room: Room): boolean {
        return (this.c1.x <= room.c2.x && this.c2.x >= room.c1.x
            && this.c1.y <= room.c2.y && this.c2.y >= room.c1.y);
    }
}

export default Room;