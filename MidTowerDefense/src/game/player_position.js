const DIRECTION_TOP = 'top';
const DIRECTION_BOTTOM = 'bottom';
const DIRECTION_LEFT = 'left';
const DIRECTION_RIGHT = 'right';

const ALL_DIRECTIONS = [DIRECTION_TOP, DIRECTION_BOTTOM, DIRECTION_LEFT, DIRECTION_RIGHT];

const PLAYER_GRID_POSITIONS = {
    top: { gridX: 12, gridY: 11 },
    bottom: { gridX: 12, gridY: 13 },
    left: { gridX: 11, gridY: 12 },
    right: { gridX: 13, gridY: 12 }
};

function getPlayerGridPosition(direction) {
    return PLAYER_GRID_POSITIONS[direction];
}

export { DIRECTION_TOP, DIRECTION_BOTTOM, DIRECTION_LEFT, DIRECTION_RIGHT, ALL_DIRECTIONS, PLAYER_GRID_POSITIONS, getPlayerGridPosition };