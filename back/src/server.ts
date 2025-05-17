import { IncomingMessage } from 'node:http';

import WebSocket, { WebSocketServer } from 'ws';

import { webSocketController } from './controllers/webSocket/webSocket.controller.ts';

export const startWebSocketServer = (port: number) => {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
    const ip = request.socket.remoteAddress;
    console.log('ip: ', ip);

    webSocketController.init(ws);
  });
};
