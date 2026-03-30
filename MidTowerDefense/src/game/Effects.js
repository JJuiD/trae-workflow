class Effects {
    static particles = [];

    static update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= deltaTime;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            if (p.gravity) {
                p.vy += p.gravity * deltaTime;
            }
            if (p.alpha !== undefined) {
                p.alpha = Math.max(0, p.life / p.maxLife);
            }
        }
    }

    static render(ctx) {
        for (const p of this.particles) {
            this.renderParticle(ctx, p);
        }
    }

    static renderParticle(ctx, p) {
        ctx.save();
        ctx.globalAlpha = p.alpha !== undefined ? p.alpha : 1;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.strokeColor || p.color;
        ctx.lineWidth = p.lineWidth || 1;

        switch (p.shape) {
            case 'line':
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.dx, p.y + p.dy);
                ctx.stroke();
                break;
            case 'circle':
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                if (p.fill) ctx.fill();
                else ctx.stroke();
                break;
            case 'triangle':
                this.drawPolygon(ctx, p.x, p.y, 3, p.radius, p.rotation || 0);
                if (p.fill) ctx.fill();
                else ctx.stroke();
                break;
            case 'pentagon':
                this.drawPolygon(ctx, p.x, p.y, 5, p.radius, p.rotation || 0);
                if (p.fill) ctx.fill();
                else ctx.stroke();
                break;
            case 'hexagon':
                this.drawPolygon(ctx, p.x, p.y, 6, p.radius, p.rotation || 0);
                if (p.fill) ctx.fill();
                else ctx.stroke();
                break;
            case 'square':
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation || 0);
                if (p.fill) ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
                else ctx.strokeRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
                ctx.restore();
                break;
            case 'arc':
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, p.startAngle || 0, p.endAngle || Math.PI * 2);
                ctx.stroke();
                break;
            case 'bezier':
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.bezierCurveTo(p.cx1, p.cy1, p.cx2, p.cy2, p.ex, p.ey);
                ctx.stroke();
                break;
            default:
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius || 3, 0, Math.PI * 2);
                ctx.fill();
        }
        ctx.restore();
    }

    static drawPolygon(ctx, x, y, sides, radius, rotation) {
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 + rotation;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
    }

    static addArrowTrail(x, y, targetX, targetY, color) {
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const segments = Math.ceil(dist / 15);

        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const px = x + dx * t;
            const py = y + dy * t;
            const alpha = 1 - t * 0.7;
            const size = 4 - t * 2;

            this.particles.push({
                shape: 'line',
                x: px,
                y: py,
                dx: dx / segments * 0.5,
                dy: dy / segments * 0.5,
                color: color,
                lineWidth: size,
                alpha: alpha,
                life: 0.15,
                maxLife: 0.15
            });
        }
    }

    static addMageOrb(x, y, targetX, targetY, color) {
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const perpAngle = angle + Math.PI / 2;

        for (let i = 0; i < 3; i++) {
            const offset = (i - 1) * 8;
            const midX = x + dx * 0.5 + Math.cos(perpAngle) * offset;
            const midY = y + dy * 0.5 + Math.sin(perpAngle) * offset;

            this.particles.push({
                shape: 'pentagon',
                x: midX,
                y: midY,
                radius: 6,
                rotation: Date.now() * 0.01,
                color: color,
                fill: true,
                alpha: 0.8,
                life: 0.2,
                maxLife: 0.2
            });
        }

        this.particles.push({
            shape: 'circle',
            x: targetX,
            y: targetY,
            radius: 12,
            color: color,
            fill: true,
            alpha: 0.6,
            life: 0.15,
            maxLife: 0.15
        });
    }

    static addCannonExplosion(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const speed = 80 + Math.random() * 60;
            const size = 4 + Math.random() * 4;

            this.particles.push({
                shape: 'circle',
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: size,
                color: color,
                fill: true,
                alpha: 1,
                life: 0.25,
                maxLife: 0.25,
                gravity: 100
            });
        }

        this.particles.push({
            shape: 'circle',
            x: x,
            y: y,
            radius: 5,
            color: '#ffffff',
            fill: true,
            alpha: 1,
            life: 0.1,
            maxLife: 0.1
        });
    }

    static addGuardianSlash(x, y, targetX, targetY, color) {
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        for (let i = 0; i < 3; i++) {
            const offset = (i - 1) * 12;
            const perpX = Math.cos(angle + Math.PI / 2) * offset;
            const perpY = Math.sin(angle + Math.PI / 2) * offset;

            this.particles.push({
                shape: 'square',
                x: x + perpX,
                y: y + perpY,
                radius: 8 - i * 2,
                rotation: angle + Math.PI / 4,
                color: color,
                fill: true,
                alpha: 0.9 - i * 0.2,
                life: 0.12,
                maxLife: 0.12
            });
        }

        this.particles.push({
            shape: 'line',
            x: x,
            y: y,
            dx: dx,
            dy: dy,
            color: color,
            lineWidth: 6,
            alpha: 0.8,
            life: 0.1,
            maxLife: 0.1
        });
    }

    static addSupportAura(x, y, color) {
        const time = Date.now() * 0.003;

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + time;
            const radius = 30 + Math.sin(time * 2 + i) * 5;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;

            this.particles.push({
                shape: 'hexagon',
                x: px,
                y: py,
                radius: 5,
                rotation: time,
                color: color,
                fill: true,
                alpha: 0.7,
                life: 0.5,
                maxLife: 0.5
            });
        }

        this.particles.push({
            shape: 'arc',
            x: x,
            y: y,
            radius: 25 + Math.sin(time) * 3,
            startAngle: 0,
            endAngle: Math.PI * 2,
            color: color,
            lineWidth: 2,
            alpha: 0.4,
            life: 0.3,
            maxLife: 0.3
        });
    }

    static clear() {
        this.particles = [];
    }
}

export { Effects };
