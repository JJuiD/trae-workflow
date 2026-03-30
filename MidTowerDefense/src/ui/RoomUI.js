import { RoomManager, MAX_PLAYERS, SEAT_COLORS } from '../network/RoomManager.js';
import { getAllTowerTypes } from '../game/tower_types.js';
import { createLogger } from '../utils/logger.js';

const LOG = createLogger('RoomUI');
const PLAYER_NAME_KEY = 'midtower_player_name';

class RoomUI {
    constructor(container, onGameStart) {
        LOG.debug('RoomUI constructing...');
        this.container = container;
        this.onGameStart = onGameStart;
        this.roomManager = new RoomManager();
        this.playerName = this.loadPlayerName();
        this.currentView = 'menu';
        this.pendingSwapSeat = null;
        this.showingTowerList = false;
        this.selectedTowerInfo = null;
        LOG.debug('Calling init...');
        this.init();
    }

    loadPlayerName() {
        return localStorage.getItem(PLAYER_NAME_KEY) || '';
    }

    savePlayerName(name) {
        this.playerName = name;
        localStorage.setItem(PLAYER_NAME_KEY, name);
    }

    init() {
        this.roomManager.onPlayerJoined = (player) => this.handlePlayerJoined(player);
        this.roomManager.onPlayerLeft = (player) => this.handlePlayerLeft(player);
        this.roomManager.onSeatSwapRequest = (fromPlayer, toSeat) => this.handleSeatSwapRequest(fromPlayer, toSeat);
        this.roomManager.onSeatSwapConfirm = (data) => this.handleSeatSwapConfirm(data);
        this.roomManager.onTowerSelected = (data) => this.handleTowerSelected(data);
        this.roomManager.onReadyChanged = (data) => this.handleReadyChanged(data);
        this.roomManager.onConnectionFailed = (reason) => this.handleConnectionFailed(reason);
        this.roomManager.onRoomClosed = () => this.handleRoomClosed();
        this.showMenu();
    }

    showMenu() {
        this.pendingSwapSeat = null;
        this.currentView = 'menu';
        
        const existingModal = document.getElementById('swap-modal');
        if (existingModal) {
            existingModal.classList.add('hidden');
        }
        
        this.container.innerHTML = `
            <div class="room-menu">
                <h2>中间塔防</h2>
                <div class="form-group">
                    <label>你的名字</label>
                    <input type="text" id="input-player-name" placeholder="输入名字" maxlength="16" value="${this.playerName}">
                </div>
                <div class="menu-buttons">
                    <button id="btn-create-room">创建房间</button>
                    <button id="btn-join-room">加入房间</button>
                </div>
            </div>
        `;
        this.bindMenuEvents();
    }

    bindMenuEvents() {
        const btnCreate = document.getElementById('btn-create-room');
        const btnJoin = document.getElementById('btn-join-room');
        const inputName = document.getElementById('input-player-name');

        if (inputName) {
            inputName.addEventListener('change', () => {
                this.savePlayerName(inputName.value.trim());
            });
        }

        if (btnCreate) {
            btnCreate.addEventListener('click', () => {
                const name = inputName.value.trim() || `玩家${Math.floor(Math.random() * 1000)}`;
                this.savePlayerName(name);
                this.showCreateRoom(name);
            });
        }
        if (btnJoin) {
            btnJoin.addEventListener('click', () => {
                const name = inputName.value.trim() || `玩家${Math.floor(Math.random() * 1000)}`;
                this.savePlayerName(name);
                this.showJoinRoom(name);
            });
        }
    }

    showCreateRoom(savedName) {
        this.createRoom(savedName || this.playerName);
    }

    showJoinRoom(savedName) {
        this.container.innerHTML = `
            <div class="room-form">
                <h2>加入房间</h2>
                <div class="form-group">
                    <label>你的名字</label>
                    <input type="text" id="input-player-name" placeholder="输入名字" maxlength="16" value="${savedName}">
                </div>
                <div class="form-group">
                    <label>房间ID</label>
                    <input type="text" id="input-room-id" placeholder="输入房间ID">
                </div>
                <div class="form-buttons">
                    <button id="btn-confirm-join">加入</button>
                    <button id="btn-cancel">取消</button>
                </div>
                <div id="join-error" class="error-message"></div>
            </div>
        `;
        this.bindJoinRoomEvents();
    }

    bindJoinRoomEvents() {
        const btnConfirm = document.getElementById('btn-confirm-join');
        const btnCancel = document.getElementById('btn-cancel');
        const inputName = document.getElementById('input-player-name');
        const inputRoomId = document.getElementById('input-room-id');

        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                const name = inputName.value.trim() || `玩家${Math.floor(Math.random() * 1000)}`;
                const roomId = inputRoomId.value.trim();
                if (roomId) {
                    this.savePlayerName(name);
                    this.joinRoom(name, roomId);
                }
            });
        }
        if (btnCancel) {
            btnCancel.addEventListener('click', () => this.showMenu());
        }
    }

    createRoom(name) {
        this.playerName = name;
        this.roomManager.init(name, (success, result) => {
            if (success) {
                this.roomManager.createRoom((roomCreated, roomId) => {
                    if (roomCreated) {
                        this.showRoom();
                    }
                });
            }
        });
    }

    joinRoom(name, roomId) {
        this.playerName = name;
        this.roomManager.init(name, (success, result) => {
            if (success) {
                this.roomManager.joinRoom(roomId, (joined, error) => {
                    if (joined) {
                        this.showRoom();
                    } else {
                        this.showJoinError('无法加入房间：' + error);
                    }
                });
            } else {
                this.showJoinError('连接失败：' + result);
            }
        });
    }

    showJoinError(message) {
        const errorDiv = document.getElementById('join-error');
        if (errorDiv) {
            errorDiv.textContent = message;
        }
    }

    showRoom() {
        this.currentView = 'room';
        this.pendingSwapSeat = null;
        this.showingTowerList = false;
        this.selectedTowerInfo = null;

        this.container.innerHTML = `
            <div class="room-view">
                <div class="room-header">
                    <div class="room-info">
                        <span>房间ID: <strong id="room-id"></strong></span>
                        <button id="btn-copy-room-id" class="btn-copy">复制</button>
                    </div>
                    <div class="room-actions">
                        ${this.roomManager.isHost ? '<button id="btn-start-game" class="btn-start">开始游戏</button>' : ''}
                        <button id="btn-leave-room" class="btn-leave">离开</button>
                    </div>
                </div>
                <div class="room-content">
                    <div class="players-column">
                        <h3>玩家列表</h3>
                        <div id="player-list" class="player-list"></div>
                    </div>
                    <div class="tower-column">
                        <h3>防御塔</h3>
                        <button id="btn-toggle-towers" class="btn-toggle-towers">选择防御塔</button>
                        <div id="tower-info" class="tower-info">
                            <div class="tower-placeholder">请选择防御塔</div>
                        </div>
                    </div>
                </div>
                <div class="ready-section">
                    <button id="btn-toggle-ready" class="btn-ready">准备</button>
                </div>
            </div>
            <div id="tower-select-modal" class="modal hidden">
                <div class="modal-content tower-select-content">
                    <h3>选择防御塔</h3>
                    <div id="tower-selection" class="tower-selection-grid"></div>
                    <button id="btn-close-tower-select" class="btn-close">关闭</button>
                </div>
            </div>
            <div id="swap-modal" class="modal hidden" style="display: none !important;">
                <div class="modal-content">
                    <p id="swap-message"></p>
                    <div class="modal-buttons">
                        <button id="btn-swap-accept">接受</button>
                        <button id="btn-swap-reject">拒绝</button>
                    </div>
                </div>
            </div>
        `;
        this.bindRoomEvents();
        this.updateRoomUI();
    }

    bindRoomEvents() {
        const btnCopy = document.getElementById('btn-copy-room-id');
        const btnLeave = document.getElementById('btn-leave-room');
        const btnReady = document.getElementById('btn-toggle-ready');
        const btnStart = document.getElementById('btn-start-game');
        const btnSwapAccept = document.getElementById('btn-swap-accept');
        const btnSwapReject = document.getElementById('btn-swap-reject');
        const btnToggleTowers = document.getElementById('btn-toggle-towers');
        const btnCloseTowerSelect = document.getElementById('btn-close-tower-select');

        if (btnCopy) {
            btnCopy.addEventListener('click', () => {
                navigator.clipboard.writeText(this.roomManager.roomId);
                btnCopy.textContent = '已复制';
                setTimeout(() => btnCopy.textContent = '复制', 1500);
            });
        }
        if (btnLeave) {
            btnLeave.addEventListener('click', () => this.leaveRoom());
        }
        if (btnReady) {
            btnReady.addEventListener('click', () => this.toggleReady());
        }
        if (btnStart) {
            btnStart.addEventListener('click', () => this.startGame());
        }
        if (btnSwapAccept) {
            btnSwapAccept.addEventListener('click', () => this.acceptSwap());
        }
        if (btnSwapReject) {
            btnSwapReject.addEventListener('click', () => this.rejectSwap());
        }
        if (btnToggleTowers) {
            btnToggleTowers.addEventListener('click', () => this.showTowerSelectModal());
        }
        if (btnCloseTowerSelect) {
            btnCloseTowerSelect.addEventListener('click', () => this.hideTowerSelectModal());
        }
    }

    showTowerSelectModal() {
        const modal = document.getElementById('tower-select-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.renderTowerList();
        }
    }

    hideTowerSelectModal() {
        const modal = document.getElementById('tower-select-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    toggleTowerList() {
        this.showingTowerList = !this.showingTowerList;
        const towerSelection = document.getElementById('tower-selection');
        const towerInfo = document.getElementById('tower-info');
        const btnToggle = document.getElementById('btn-toggle-towers');

        if (this.showingTowerList) {
            towerSelection.classList.remove('hidden');
            towerInfo.classList.add('hidden');
            btnToggle.textContent = '显示详情';
            this.renderTowerList();
        } else {
            towerSelection.classList.add('hidden');
            towerInfo.classList.remove('hidden');
            btnToggle.textContent = '选择防御塔';
        }
    }

    renderTowerList() {
        const towerDiv = document.getElementById('tower-selection');
        if (!towerDiv) return;

        const towerTypes = getAllTowerTypes();
        const selectedTower = this.roomManager.selectedTower;
        towerDiv.innerHTML = '';

        towerTypes.forEach(tower => {
            const towerCard = document.createElement('div');
            towerCard.className = `tower-icon-btn ${selectedTower === tower.id ? 'selected' : ''}`;
            towerCard.dataset.towerId = tower.id;
            towerCard.style.backgroundColor = tower.color;
            towerCard.innerHTML = `<span class="tower-initial">${tower.name.charAt(0)}</span>`;
            towerCard.addEventListener('click', () => this.selectTower(tower.id));
            towerDiv.appendChild(towerCard);
        });
    }

    showTowerInfo(tower) {
        const towerInfo = document.getElementById('tower-info');
        if (!towerInfo) return;

        towerInfo.innerHTML = `
            <div class="tower-detail-icon" style="background-color: ${tower.color}"></div>
            <div class="tower-detail-name">${tower.name}</div>
            <div class="tower-detail-stats">
                <div>伤害: ${tower.damage}</div>
                <div>攻速: ${(1 / tower.attackCooldown).toFixed(1)}/秒</div>
                <div>范围: ${tower.attackRange}</div>
            </div>
            <div class="tower-detail-desc">${tower.description}</div>
        `;
    }

    selectTower(towerId) {
        this.roomManager.selectTower(towerId);
        this.selectedTowerInfo = getAllTowerTypes().find(t => t.id === towerId);
        this.hideTowerSelectModal();

        if (this.selectedTowerInfo) {
            this.showTowerInfo(this.selectedTowerInfo);
            document.getElementById('btn-toggle-towers').textContent = `已选: ${this.selectedTowerInfo.name}`;
        }
    }

    updateRoomUI() {
        this.updatePlayerList();
        this.updateTowerButton();
        const roomIdSpan = document.getElementById('room-id');
        if (roomIdSpan) {
            roomIdSpan.textContent = this.roomManager.roomId;
        }
        const btnReady = document.getElementById('btn-toggle-ready');
        if (btnReady) {
            btnReady.textContent = this.roomManager.isReady ? '取消准备' : '准备';
            btnReady.classList.toggle('is-ready', this.roomManager.isReady);
        }
        const myPlayer = this.roomManager.getPlayers().find(p => p.peerId === this.roomManager.peer?.id);
        if (myPlayer && myPlayer.tower) {
            const tower = getAllTowerTypes().find(t => t.id === myPlayer.tower);
            if (tower) {
                this.selectedTowerInfo = tower;
                this.showTowerInfo(tower);
            }
        }
    }

    updateTowerButton() {
        const btnToggle = document.getElementById('btn-toggle-towers');
        const selectedTower = this.roomManager.selectedTower;
        if (btnToggle && selectedTower) {
            const tower = getAllTowerTypes().find(t => t.id === selectedTower);
            if (tower) {
                btnToggle.textContent = `已选: ${tower.name}`;
            }
        }
    }

    updatePlayerList() {
        const playerListDiv = document.getElementById('player-list');
        if (!playerListDiv) return;

        const players = this.roomManager.getPlayers();
        playerListDiv.innerHTML = '';

        for (let seat = 1; seat <= MAX_PLAYERS; seat++) {
            const player = players.find(p => p.seat === seat);
            const seatColor = SEAT_COLORS[seat - 1];
            const seatDiv = document.createElement('div');
            seatDiv.className = 'player-slot';
            seatDiv.dataset.seat = seat;

            if (player) {
                const isMe = player.peerId === this.roomManager.peer?.id;
                const towerName = player.tower ? (getAllTowerTypes().find(t => t.id === player.tower)?.name || player.tower) : '未选塔';
                seatDiv.innerHTML = `
                    <div class="seat-badge" style="background-color: ${seatColor}">${seat}</div>
                    <div class="player-details">
                        <div class="player-name-row">
                            ${player.isHost ? '<span class="host-badge">👑</span>' : ''}
                            <span class="player-name">${player.name}${isMe ? ' (你)' : ''}</span>
                        </div>
                        <div class="player-tower">${towerName}</div>
                    </div>
                    <div class="ready-indicator ${player.isReady ? 'ready' : ''}">${player.isReady ? '✓' : ''}</div>
                `;
            } else {
                seatDiv.innerHTML = `
                    <div class="seat-badge empty" style="background-color: ${seatColor}">${seat}</div>
                    <div class="player-details">
                        <div class="player-name empty-text">空座位</div>
                    </div>
                    <div class="swap-hint">点击交换</div>
                `;
                seatDiv.addEventListener('click', () => this.requestSeatSwap(seat));
            }

            playerListDiv.appendChild(seatDiv);
        }
    }

    toggleReady() {
        this.roomManager.setReady(!this.roomManager.isReady);
        this.updateRoomUI();
    }

    requestSeatSwap(targetSeat) {
        if (this.roomManager.requestSeatSwap(targetSeat)) {
            const btn = document.querySelector(`[data-seat="${targetSeat}"]`);
            if (btn) {
                btn.classList.add('swap-pending');
            }
        }
    }

    handleSeatSwapRequest(fromPlayer, toSeat) {
        LOG.debug('handleSeatSwapRequest called:', { fromPlayer, toSeat, currentView: this.currentView });
        if (this.currentView !== 'room') {
            LOG.debug('Ignoring: not in room view');
            return;
        }
        if (!fromPlayer || !toSeat) {
            LOG.debug('Ignoring: invalid parameters');
            return;
        }
        if (!fromPlayer.name) {
            LOG.debug('Ignoring: no player name');
            return;
        }

        const modal = document.getElementById('swap-modal');
        const message = document.getElementById('swap-message');
        if (!modal || !message) {
            LOG.debug('Ignoring: modal elements not found');
            return;
        }

        this.pendingSwapSeat = toSeat;
        LOG.debug('Showing modal with:', `${fromPlayer.name} 想和你交换座位 (座位 ${toSeat})`);
        message.textContent = `${fromPlayer.name} 想和你交换座位 (座位 ${toSeat})`;
        modal.classList.remove('hidden');
    }

    acceptSwap() {
        this.roomManager.respondToSeatSwap(true);
        this.closeSwapModal();
    }

    rejectSwap() {
        this.roomManager.respondToSeatSwap(false);
        this.closeSwapModal();
    }

    closeSwapModal() {
        const modal = document.getElementById('swap-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.pendingSwapSeat = null;
    }

    handleSeatSwapConfirm(data) {
        this.updatePlayerList();
    }

    handlePlayerJoined(player) {
        this.updatePlayerList();
    }

    handlePlayerLeft(player) {
        this.updatePlayerList();
    }

    handleTowerSelected(data) {
        this.updatePlayerList();
    }

    handleReadyChanged(data) {
        this.updatePlayerList();
    }

    handleConnectionFailed(reason) {
        alert('连接失败：' + reason);
        this.showMenu();
    }

    handleRoomClosed() {
        alert('房间已关闭');
        this.showMenu();
    }

    leaveRoom() {
        this.roomManager.leaveRoom();
        this.showMenu();
    }

    startGame() {
        const players = this.roomManager.getPlayers();
        LOG.debug('startGame called, players:', players.length, 'isHost:', this.roomManager.isHost);
        const allReady = players.every(p => p.isReady);
        LOG.debug('allReady:', allReady);
        if (!allReady) {
            alert('所有玩家必须准备才能开始');
            return;
        }
        if (players.length < 1) {
            alert('需要至少1名玩家');
            return;
        }
        if (this.onGameStart) {
            this.onGameStart(players, this.roomManager.roomId);
        }
    }
}

export { RoomUI };
