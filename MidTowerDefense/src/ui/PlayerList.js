import { MAX_PLAYERS, SEAT_COLORS } from '../network/RoomManager.js';

class PlayerList {
    constructor() {
        this.players = [];
        this.currentPlayerId = null;
        this.onSeatClick = null;
    }

    setPlayers(players, currentPlayerId) {
        this.players = players;
        this.currentPlayerId = currentPlayerId;
    }

    render(container) {
        if (!container) return;

        container.innerHTML = '';
        container.className = 'player-list';

        for (let seat = 1; seat <= MAX_PLAYERS; seat++) {
            const player = this.players.find(p => p.seat === seat);
            const seatColor = SEAT_COLORS[seat - 1];
            const slotEl = this.createSeatSlot(seat, player, seatColor);
            container.appendChild(slotEl);
        }
    }

    createSeatSlot(seat, player, seatColor) {
        const slot = document.createElement('div');
        slot.className = 'player-slot';
        slot.dataset.seat = seat;
        slot.style.borderColor = seatColor;

        if (player) {
            const isMe = player.peerId === this.currentPlayerId;
            slot.innerHTML = this.createPlayerHTML(player, isMe);

            if (!isMe) {
                slot.addEventListener('click', () => {
                    if (this.onSeatClick) {
                        this.onSeatClick(seat, player);
                    }
                });
            }
        } else {
            slot.innerHTML = this.createEmptySlotHTML(seat);
            slot.addEventListener('click', () => {
                if (this.onSeatClick) {
                    this.onSeatClick(seat, null);
                }
            });
        }

        return slot;
    }

    createPlayerHTML(player, isMe) {
        return `
            <div class="player-info">
                ${player.isHost ? '<span class="host-icon">👑</span>' : ''}
                <span class="player-name">${this.escapeHTML(player.name)}${isMe ? ' (你)' : ''}</span>
                ${player.isReady ? '<span class="ready-badge">✓</span>' : ''}
            </div>
            <div class="tower-preview">${player.tower || '未选择'}</div>
        `;
    }

    createEmptySlotHTML(seat) {
        return `
            <div class="empty-slot">
                <span class="seat-number">座位 ${seat}</span>
                <span class="empty-hint">点击交换</span>
            </div>
        `;
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    updatePlayer(playerId, updates) {
        const player = this.players.find(p => p.peerId === playerId);
        if (player) {
            Object.assign(player, updates);
        }
    }

    addPlayer(player) {
        const exists = this.players.find(p => p.peerId === player.peerId);
        if (!exists) {
            this.players.push(player);
        }
    }

    removePlayer(playerId) {
        this.players = this.players.filter(p => p.peerId !== playerId);
    }

    getPlayer(playerId) {
        return this.players.find(p => p.peerId === playerId);
    }

    getPlayerBySeat(seat) {
        return this.players.find(p => p.seat === seat);
    }
}

export { PlayerList, MAX_PLAYERS, SEAT_COLORS };
