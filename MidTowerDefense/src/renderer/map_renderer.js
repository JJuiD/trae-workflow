const GRID_COLOR = '#1a1a2e';
const GRID_LINE_WIDTH = 1;

const PLAYER_POSITION_COLORS = {
    top: '#ff6b6b',
    bottom: '#4ecdc4',
    left: '#ffe66d',
    right: '#95e1d3'
};

const OCCUPIED_ALPHA = 0.3;
const AVAILABLE_ALPHA = 0.8;

class MapRenderer {
    constructor(ctx, tileSize) {
        this.ctx = ctx;
        this.tileSize = tileSize;
    }

    renderGrid(map) {
        const { ctx, tileSize } = this;
        const mapSize = map.size;
        const offsetX = 0;
        const offsetY = 0;

        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = GRID_LINE_WIDTH;

        for (let i = 0; i <= mapSize; i++) {
            ctx.beginPath();
            ctx.moveTo(offsetX + i * tileSize, offsetY);
            ctx.lineTo(offsetX + i * tileSize, offsetY + mapSize * tileSize);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY + i * tileSize);
            ctx.lineTo(offsetX + mapSize * tileSize, offsetY + i * tileSize);
            ctx.stroke();
        }
    }

    renderCrystal(crystal) {
        const { ctx } = this;

        ctx.save();
        ctx.fillStyle = crystal.getColor();
        ctx.shadowColor = crystal.getColor();
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(crystal.x, crystal.y, crystal.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${crystal.health}/${crystal.maxHealth}`, crystal.x, crystal.y + crystal.size);
    }

    renderPlayerPositions(map, occupiedDirections = []) {
        const { ctx, tileSize } = this;
        const directions = ['top', 'bottom', 'left', 'right'];

        for (const direction of directions) {
            const pos = this.getPositionCenter(map, direction);
            const isOccupied = occupiedDirections.includes(direction);
            const color = PLAYER_POSITION_COLORS[direction];
            const alpha = isOccupied ? OCCUPIED_ALPHA : AVAILABLE_ALPHA;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, tileSize / 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isOccupied ? '#666666' : '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(direction.charAt(0).toUpperCase(), pos.x, pos.y);

            ctx.restore();
        }
    }

    getPositionCenter(map, direction) {
        const positions = {
            top: { gridX: 12, gridY: 11 },
            bottom: { gridX: 12, gridY: 13 },
            left: { gridX: 11, gridY: 12 },
            right: { gridX: 13, gridY: 12 }
        };
        const pos = positions[direction];
        return {
            x: pos.gridX * this.tileSize + this.tileSize / 2,
            y: pos.gridY * this.tileSize + this.tileSize / 2
        };
    }

    renderMap(map, crystal, occupiedDirections = []) {
        this.renderGrid(map);
        this.renderCrystal(crystal);
        this.renderPlayerPositions(map, occupiedDirections);
    }
}

export { MapRenderer, PLAYER_POSITION_COLORS };