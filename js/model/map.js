import {randomWeightChoose} from '../utils.js';


export class Tileset {
  constructor(src, blockSize, blockMap, rule) {
    this.src = src;
    this.rawBlockSize = blockSize;
    this.blockMap = blockMap;
    this.length = 8;
    this.rule = rule;
  }
}

export class Map {
  constructor(size, tileset) {
    this.size = size;
    this.tileset = tileset;
    this.tilesetImage = new Image();
    this.tilesetImage.src = tileset.src;
    this.blockSize = 64;
    this.map = Array();
  }
  getBlockId(x, y) {
    return this.map[x + y * this.size]
  }
  init() {
    for (let i = 0; i < this.size * this.size; i++) {
      const blockType = randomWeightChoose(this.tileset.rule);
      const length = this.tileset.blockMap[blockType].length;

      this.map.push(
          this.tileset.blockMap[blockType][Math.floor(length * Math.random())])
    }
  }
  render(ctx, canvas, camera) {
    const cols = Math.round(canvas.width / this.blockSize) + 3;
    const rows = Math.round(canvas.height / this.blockSize) + 4;
    const xOffset = Math.floor(camera.pos.x / this.blockSize) - 1;
    const yOffset = Math.floor(camera.pos.y / this.blockSize) - 1;
    for (let i = xOffset; i < cols + xOffset; i++) {
      for (let j = yOffset; j < rows + yOffset; j++) {
        ctx.imageSmoothingEnabled = false;
        const blockId = this.getBlockId(i, j);
        ctx.drawImage(
            this.tilesetImage,
            blockId % this.tileset.length * this.tileset.rawBlockSize,
            Math.floor(blockId / this.tileset.length) *
                this.tileset.rawBlockSize,
            this.tileset.rawBlockSize, this.tileset.rawBlockSize,
            i * this.blockSize - camera.pos.x, j * this.blockSize - camera.pos.y,
            this.blockSize, this.blockSize);
      }
    }

    // for (let i = 0; i < mapLength * mapLength; i++) {
    //   x = i % mapLength;
    //   y = Math.floor(i / mapLength)
    //   ctx.imageSmoothingEnabled = false;

    //   ctx.drawImage(
    //       grassTileset, map[i] % 8 * 32, Math.floor(map[i] / 8) * 32, 32, 32,
    //       x * blockSize, y * blockSize, blockSize, blockSize);
    // }
  }
}