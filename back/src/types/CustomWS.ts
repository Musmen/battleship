import WebSocket from 'ws';

import type { Player } from './Player.ts';

export type CustomWebSocket = WebSocket & { player: Player | undefined };
