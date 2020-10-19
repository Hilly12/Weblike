class GameMap {
  public readonly width: number;
  public readonly height: number;
  public readonly board: number[][];

  public constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.board = [];
    for (let x = 0; x < width; x++) {
      this.board[x] = [];
      for (let y = 0; y < height; y++) {
        this.board[x][y] = 1;
      }
    }
  }

  public get(x: number, y: number): number {
    return this.board[x][y];
  }

  public set(x: number, y: number, v: number) {
    this.board[x][y] = v;
  }

}

export default GameMap;