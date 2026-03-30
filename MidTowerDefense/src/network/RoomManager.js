import { createLogger } from '../utils/logger.js';

const PEER_CONFIG = {
    debug: 1,
    host: 'localhost',
    port: 9001,
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    }
};

const MAX_PLAYERS = 4;
const SEAT_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
const SEAT_SWAP_COOLDOWN = 1000;
const SEAT_SWAP_REQUEST_TIMEOUT = 10000;
const ROOM_STATES = { WAITING: 'waiting', PLAYING: 'playing' };

const LOG = createLogger('Room');

class RoomManager {
    constructor() {
        LOG.debug('RoomManager constructed');
        this.peer = null;
        this.connections = new Map();
        this.players = new Map();
        this.roomId = null;
        this.isHost = false;
        this.playerName = '';
        this.seatNumber = 0;
        this.selectedTower = null;
        this.isReady = false;
        this.roomState = ROOM_STATES.WAITING;
        this.seatSwapCooldown = 0;
        this.pendingSwapRequest = null;
        this.swapRequestTimeout = null;
        this.onPlayerJoined = null;
        this.onPlayerLeft = null;
        this.onSeatSwapRequest = null;
        this.onSeatSwapConfirm = null;
        this.onTowerSelected = null;
        this.onReadyChanged = null;
        this.onConnectionFailed = null;
        this.onRoomClosed = null;
        this.onRoomStateChanged = null;
    }

    init(playerName, callback) {
        this.playerName = playerName;
        const peerId = `${playerName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        LOG.info('DEBUG RoomManager.init: creating Peer with id=', peerId);
        this.peer = new Peer(peerId, PEER_CONFIG);

        this.peer.on('open', (id) => {
            LOG.info('Peer connected with ID:', id);
            if (callback) callback(true, id);
        });

        this.peer.on('error', (err) => {
            LOG.error('Peer error:', err);
            if (callback) callback(false, err.type);
        });

        this.peer.on('connection', (conn) => {
            this.handleIncomingConnection(conn);
        });
    }

    createRoom(callback) {
        if (!this.peer) {
            if (callback) callback(false, 'Not initialized');
            return;
        }

        this.roomId = this.peer.id;
        this.isHost = true;
        this.seatNumber = 1;
        this.selectedTower = 'archer';
        this.players.set(this.peer.id, {
            peerId: this.peer.id,
            name: this.playerName,
            seat: 1,
            isHost: true,
            isReady: false,
            tower: 'archer'
        });

        if (callback) callback(true, this.roomId);
    }

    joinRoom(roomId, callback) {
        if (!this.peer) {
            if (callback) callback(false, 'Not initialized');
            return;
        }

        this.roomId = roomId;
        this.isHost = false;

        const hostConn = this.peer.connect(roomId, {
            reliable: true,
            metadata: { playerName: this.playerName }
        });

        hostConn.on('open', () => {
            LOG.info('Connected to host:', roomId);
            this.connections.set(roomId, hostConn);
            this.setupConnectionHandlers(hostConn);
            this.sendMessage(hostConn, { type: 'join_request', playerName: this.playerName });
            if (callback) callback(true);
        });

        hostConn.on('error', (err) => {
            LOG.error('Connection error:', err);
            if (callback) callback(false, err);
        });
    }

    handleIncomingConnection(conn) {
        conn.on('open', () => {
            LOG.info('Incoming connection from:', conn.peer);
            this.connections.set(conn.peer, conn);
            this.setupConnectionHandlers(conn);
        });
    }

    setupConnectionHandlers(conn) {
        conn.on('data', (data) => {
            this.handleMessage(conn, data);
        });

        conn.on('close', () => {
            const peerId = conn.peer;
            LOG.info('Player disconnected:', peerId);
            this.handlePlayerDisconnect(peerId);
        });

        conn.on('error', (err) => {
            LOG.error('Connection error:', err);
        });
    }

    handleMessage(conn, data) {
        switch (data.type) {
            case 'join_request':
                this.handleJoinRequest(conn, data);
                break;
            case 'join_approved':
                this.handleJoinApproved(data);
                break;
            case 'join_rejected':
                this.handleJoinRejected(data);
                break;
            case 'player_list_update':
                this.handlePlayerListUpdate(data);
                break;
            case 'seat_swap_request':
                this.handleSeatSwapRequest(conn, data);
                break;
            case 'seat_swap_response':
                this.handleSeatSwapResponse(data);
                break;
            case 'tower_selection':
                this.handleTowerSelection(data);
                break;
            case 'ready_changed':
                this.handleReadyChanged(data);
                break;
            case 'room_state_changed':
                this.handleRoomStateChanged(data);
                break;
            case 'player_left':
                this.handlePlayerLeft(data);
                break;
            case 'room_closed':
                this.handleRoomClosed();
                break;
        }
    }

    handleJoinRequest(conn, data) {
        if (!this.isHost) return;

        const currentPlayers = this.players.size;
        if (currentPlayers >= MAX_PLAYERS) {
            this.sendMessage(conn, { type: 'join_rejected', reason: 'Room is full' });
            return;
        }

        const availableSeat = this.getAvailableSeat();
        const playerData = {
            peerId: conn.peer,
            name: data.playerName,
            seat: availableSeat,
            isHost: false,
            isReady: false,
            tower: 'archer'
        };

        this.players.set(conn.peer, playerData);
        this.sendMessage(conn, {
            type: 'join_approved',
            player: playerData,
            players: Array.from(this.players.values()),
            roomState: this.roomState
        });

        this.broadcast({
            type: 'player_list_update',
            players: Array.from(this.players.values())
        }, conn);

        if (this.onPlayerJoined) {
            this.onPlayerJoined(playerData);
        }
    }

    handleJoinApproved(data) {
        this.seatNumber = data.player.seat;
        this.players.clear();
        data.players.forEach(p => this.players.set(p.peerId, p));
        if (data.roomState) {
            this.roomState = data.roomState;
        }
        if (this.onPlayerJoined) {
            this.onPlayerJoined(data.player);
        }
    }

    handleJoinRejected(data) {
        if (this.onConnectionFailed) {
            this.onConnectionFailed(data.reason);
        }
        this.disconnect();
    }

    handlePlayerListUpdate(data) {
        this.players.clear();
        data.players.forEach(p => this.players.set(p.peerId, p));
        if (this.onPlayerJoined) {
            this.onPlayerJoined({ players: data.players });
        }
    }

    handlePlayerDisconnect(peerId) {
        const player = this.players.get(peerId);
        if (!player) return;

        const wasHost = player.isHost;
        this.players.delete(peerId);
        this.connections.delete(peerId);

        this.broadcast({ type: 'player_list_update', players: Array.from(this.players.values()) });

        if (this.onPlayerLeft) {
            this.onPlayerLeft(player);
        }

        if (wasHost && !this.isHost) {
            LOG.info('Host disconnected, closing room');
            this.handleRoomClosed();
        }
    }

    handleSeatSwapRequest(conn, data) {
        LOG.debug('seat_swap_request received:', data);
        if (data.fromPeerId === this.peer.id) {
            LOG.debug('Ignoring own seat_swap_request');
            return;
        }
        if (this.seatSwapCooldown > 0) {
            LOG.debug('seat_swap_request ignored: cooldown active');
            return;
        }
        if (!data.fromPeerId || !data.fromSeat || !data.toSeat) {
            LOG.debug('seat_swap_request ignored: missing data fields');
            return;
        }
        if (data.toSeat < 1 || data.toSeat > MAX_PLAYERS) {
            LOG.debug('seat_swap_request ignored: invalid seat');
            return;
        }

        const fromPlayer = this.players.get(data.fromPeerId);
        if (!fromPlayer) {
            LOG.debug('seat_swap_request ignored: fromPlayer not found');
            return;
        }

        LOG.info('DEBUG handleSeatSwapRequest: fromPeerId=', data.fromPeerId, 'toSeat=', data.toSeat, 'fromPlayer=', JSON.stringify(fromPlayer));
        LOG.info('DEBUG handleSeatSwapRequest: my peer.id=', this.peer.id, 'my seat=', this.seatNumber);

        LOG.debug('seat_swap_request accepted:', fromPlayer.name, '-> seat', data.toSeat);

        this.pendingSwapRequest = {
            from: data.fromPeerId,
            fromSeat: data.fromSeat,
            toSeat: data.toSeat
        };

        if (this.onSeatSwapRequest) {
            this.onSeatSwapRequest(fromPlayer, data.toSeat);
        }

        this.swapRequestTimeout = setTimeout(() => {
            this.pendingSwapRequest = null;
        }, SEAT_SWAP_REQUEST_TIMEOUT);
    }

    handleSeatSwapResponse(data) {
        if (this.swapRequestTimeout) {
            clearTimeout(this.swapRequestTimeout);
            this.swapRequestTimeout = null;
        }

        if (data.accepted) {
            const myPlayer = this.players.get(this.peer.id);
            if (myPlayer) {
                myPlayer.seat = data.newSeat;
                this.seatNumber = data.newSeat;
            }
        }

        this.pendingSwapRequest = null;

        if (this.onSeatSwapConfirm) {
            this.onSeatSwapConfirm(data);
        }
    }

    handleTowerSelection(data) {
        const player = this.players.get(data.peerId);
        if (player) {
            player.tower = data.tower;
            this.broadcast({ type: 'player_list_update', players: Array.from(this.players.values()) });
        }
        if (this.onTowerSelected) {
            this.onTowerSelected(data);
        }
    }

    handleReadyChanged(data) {
        const player = this.players.get(data.peerId);
        if (player) {
            player.isReady = data.isReady;
            this.broadcast({ type: 'player_list_update', players: Array.from(this.players.values()) });
        }
        if (this.onReadyChanged) {
            this.onReadyChanged(data);
        }
    }

    handleRoomStateChanged(data) {
        this.roomState = data.roomState;
        LOG.info('Room state changed to:', this.roomState);
        if (this.onRoomStateChanged) {
            this.onRoomStateChanged(this.roomState);
        }
    }

    setRoomState(state) {
        if (!this.isHost) return;
        this.roomState = state;
        LOG.info('Setting room state to:', state);
        this.broadcast({
            type: 'room_state_changed',
            roomState: state
        });
    }

    handlePlayerLeft(data) {
        const player = this.players.get(data.peerId);
        const wasHost = player?.isHost;
        if (player) {
            this.players.delete(data.peerId);
            this.connections.delete(data.peerId);
            this.broadcast({ type: 'player_list_update', players: Array.from(this.players.values()) });
            if (this.onPlayerLeft) {
                this.onPlayerLeft(player);
            }
            if (wasHost && !this.isHost) {
                LOG.info('Host left, closing room');
                this.handleRoomClosed();
            }
        }
    }

    handleRoomClosed() {
        this.disconnect();
        if (this.onRoomClosed) {
            this.onRoomClosed();
        }
    }

    requestSeatSwap(targetSeat) {
        if (this.seatSwapCooldown > 0 || !this.roomId) return false;

        const myPlayer = this.players.get(this.peer.id);
        if (!myPlayer) return false;

        if (myPlayer.seat === targetSeat) {
            LOG.info('DEBUG requestSeatSwap: same seat, ignore. mySeat=', myPlayer.seat, 'targetSeat=', targetSeat);
            return false;
        }

        const targetPlayer = this.getPlayerBySeat(targetSeat);

        LOG.info('DEBUG requestSeatSwap: myPeerId=', this.peer.id, 'mySeat=', myPlayer.seat, 'targetSeat=', targetSeat, 'targetPlayer=', JSON.stringify(targetPlayer));

        if (!targetPlayer) {
            LOG.info('DEBUG requestSeatSwap: empty seat, direct swap');
            myPlayer.seat = targetSeat;
            this.broadcast({
                type: 'player_list_update',
                players: Array.from(this.players.values())
            }, this.connections.get(this.peer.id));
            if (this.onSeatSwapConfirm) {
                this.onSeatSwapConfirm({ players: Array.from(this.players.values()) });
            }
            this.seatSwapCooldown = SEAT_SWAP_COOLDOWN;
            setTimeout(() => {
                this.seatSwapCooldown = 0;
            }, SEAT_SWAP_COOLDOWN);
            return true;
        }

        this.seatSwapCooldown = SEAT_SWAP_COOLDOWN;
        setTimeout(() => {
            this.seatSwapCooldown = 0;
        }, SEAT_SWAP_COOLDOWN);

        this.broadcast({
            type: 'seat_swap_request',
            fromPeerId: this.peer.id,
            fromSeat: myPlayer.seat,
            toSeat: targetSeat
        }, this.connections.get(this.peer.id));

        return true;
    }

    respondToSeatSwap(accept) {
        if (!this.pendingSwapRequest) return;

        const { from, fromSeat, toSeat } = this.pendingSwapRequest;

        if (accept) {
            const fromPlayer = this.players.get(from);
            if (fromPlayer) {
                fromPlayer.seat = toSeat;
            }

            const myPlayer = this.players.get(this.peer.id);
            if (myPlayer) {
                myPlayer.seat = fromSeat;
                this.seatNumber = fromSeat;
            }

            this.broadcast({
                type: 'player_list_update',
                players: Array.from(this.players.values())
            });
        }

        this.sendToPeer(from, {
            type: 'seat_swap_response',
            accepted: accept,
            fromSeat: fromSeat,
            toSeat: toSeat,
            newSeat: accept ? toSeat : this.seatNumber
        });

        this.pendingSwapRequest = null;
    }

    selectTower(towerId) {
        this.selectedTower = towerId;
        const myPlayer = this.players.get(this.peer.id);
        if (myPlayer) {
            myPlayer.tower = towerId;
        }
        this.broadcast({
            type: 'tower_selection',
            peerId: this.peer.id,
            tower: towerId
        });
        if (this.onTowerSelected) {
            this.onTowerSelected({ peerId: this.peer.id, tower: towerId });
        }
    }

    setReady(isReady) {
        LOG.debug('setReady called:', isReady);
        this.isReady = isReady;
        const myPlayer = this.players.get(this.peer.id);
        if (myPlayer) {
            myPlayer.isReady = isReady;
            LOG.debug('Player ready state updated:', myPlayer.name, isReady);
        }
        this.broadcast({
            type: 'ready_changed',
            peerId: this.peer.id,
            isReady: isReady
        });
    }

    leaveRoom() {
        this.broadcast({ type: 'player_left', peerId: this.peer.id });
        this.disconnect();
    }

    closeRoom() {
        if (!this.isHost) return;
        this.broadcast({ type: 'room_closed' });
        this.disconnect();
    }

    disconnect() {
        this.connections.forEach(conn => conn.close());
        this.connections.clear();
        this.players.clear();
        this.roomId = null;
        this.isHost = false;
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
    }

    broadcast(message, excludeConn = null) {
        this.connections.forEach((conn, peerId) => {
            if (conn !== excludeConn && conn.open) {
                this.sendMessage(conn, message);
            }
        });
    }

    sendToPeer(peerId, message) {
        const conn = this.connections.get(peerId);
        if (conn && conn.open) {
            this.sendMessage(conn, message);
        }
    }

    sendMessage(conn, message) {
        if (conn.open) {
            conn.send(message);
        }
    }

    generateRoomId() {
        return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getAvailableSeat() {
        const usedSeats = new Set();
        this.players.forEach(p => usedSeats.add(p.seat));
        for (let i = 1; i <= MAX_PLAYERS; i++) {
            if (!usedSeats.has(i)) return i;
        }
        return -1;
    }

    getPlayers() {
        return Array.from(this.players.values());
    }

    getPlayerBySeat(seat) {
        for (const player of this.players.values()) {
            if (player.seat === seat) return player;
        }
        return null;
    }

    getSeatColor(seatNumber) {
        return SEAT_COLORS[(seatNumber - 1) % MAX_PLAYERS] || SEAT_COLORS[0];
    }

    isSeatAvailable(seatNumber) {
        for (const player of this.players.values()) {
            if (player.seat === seatNumber) return false;
        }
        return true;
    }
}

export { RoomManager, MAX_PLAYERS, SEAT_COLORS, ROOM_STATES };
