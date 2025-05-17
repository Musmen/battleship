import { IncomingMessage } from 'node:http';
import WebSocket, { WebSocketServer } from 'ws';

export const startWebSocketServer = (port: number) => {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
    const ip = request.socket.remoteAddress;
    console.log('ip: ', ip);

    ws.on('error', (message) => {
      console.error('error: ', message);
    });

    ws.on('message', (data: string) => {
      console.log('received: ', JSON.parse(data));
    });

    ws.send(JSON.stringify('something'));
  });
};
