const TILE_SIZE = 32;
const DEFAULT_MAP_SIZE = 25;

const TileType = {
    EMPTY: 0,
    OBSTACLE: 1,
    SPAWN_POINT: 2
};

class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Map {
    constructor(size = DEFAULT_MAP_SIZE) {
        this.size = size;
        this.tiles = [];
        this.centerX = Math.floor(size / 2);
        this.centerY = Math.floor(size / 2);
        this.initTiles();
    }

    initTiles() {
        for (let y = 0; y < this.size; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.size; x++) {
                this.tiles[y][x] = TileType.EMPTY;
            }
        }
    }

    getTile(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
            return TileType.OBSTACLE;
        }
        return this.tiles[y][x];
    }

    setTile(x, y, tileType) {
        if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
            this.tiles[y][x] = tileType;
        }
    }

    isValidPosition(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }

    worldToGrid(worldX, worldY) {
        return {
            x: Math.floor(worldX / TILE_SIZE),
            y: Math.floor(worldY / TILE_SIZE)
        };
    }

    gridToWorld(gridX, gridY) {
        return {
            x: gridX * TILE_SIZE + TILE_SIZE / 2,
            y: gridY * TILE_SIZE + TILE_SIZE / 2
        };
    }

    getCenterWorld() {
        return this.gridToWorld(this.centerX, this.centerY);
    }
}

const DIRECTION = {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right'
};

const PLAYER_POSITIONS = {
    top: { gridX: 12, gridY: 11 },
    bottom: { gridX: 12, gridY: 13 },
    left: { gridX: 11, gridY: 12 },
    right: { gridX: 13, gridY: 12 }
};

function getPlayerWorldPosition(direction) {
    const pos = PLAYER_POSITIONS[direction];
    const centerX = Math.floor(DEFAULT_MAP_SIZE / 2);
    const centerY = Math.floor(DEFAULT_MAP_SIZE / 2);
    return {
        x: (pos.gridX - centerX) * TILE_SIZE + TILE_SIZE / 2,
        y: (pos.gridY - centerY) * TILE_SIZE + TILE_SIZE / 2
    };
}

function isDirectionOccupied(direction, occupiedDirections) {
    return occupiedDirections.includes(direction);
}

function getAvailableDirections(occupiedDirections) {
    return Object.keys(DIRECTION).filter(
        dir => !isDirectionOccupied(dir, occupiedDirections)
    );
}

export { Map, Position, TileType, TILE_SIZE, DEFAULT_MAP_SIZE, DIRECTION, PLAYER_POSITIONS, getPlayerWorldPosition, isDirectionOccupied, getAvailableDirections };