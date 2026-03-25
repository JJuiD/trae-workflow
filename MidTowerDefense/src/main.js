const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.last_time = 0;
    }

    update(delta_time) {
    }

    render() {
        this.ctx.fillStyle = '#16213e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    gameLoop(current_time) {
        const delta_time = current_time - this.last_time;
        this.last_time = current_time;

        this.update(delta_time);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    start() {
        requestAnimationFrame((time) => {
            this.last_time = time;
            this.gameLoop(time);
        });
    }
}

const game_instance = new Game(canvas, ctx);
game_instance.start();