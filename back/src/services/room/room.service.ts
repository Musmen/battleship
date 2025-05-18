import { randomUUID } from 'node:crypto';

import { webSocketController } from '../../controllers/webSocket/webSocket.controller.ts';

import { MAX_PLAYERS } from '../../common/constants.ts';

import type { Player } from '../../types/Player.ts';
import type { Room } from '../../types/Room.ts';
import type { ClientResponse } from '../../types/ClientResponse.ts';

class RoomService {
  static isRoomAvailableToAddPlayer = (room: Room) => room.players.length < MAX_PLAYERS;

  private rooms: Room[] = [];

  private addRoom = (room: Room) => {
    this.rooms.push(room);
  };

  getRoomByIndex = (roomIndex: string): Room | undefined =>
    this.rooms.find((room) => String(room.id) === roomIndex);

  roomReadyToStartGame = (room: Room | undefined): boolean => {
    return room ? room.players.length >= MAX_PLAYERS : false;
  };

  addUserToRoom = (room: Room | undefined, player: Player) => {
    if (!room || !RoomService.isRoomAvailableToAddPlayer(room) || room.players.includes(player))
      return;

    room.players.push(player);
  };

  removePlayerFromRooms = (id: string | number) => {
    this.rooms = this.rooms.map((room: Room) => ({
      id: room.id,
      players: room.players.filter((player) => player.id !== id),
    }));
  };

  removeEmptyRooms = () => {
    this.rooms = this.rooms.filter((room: Room) => room.players.length);
  };

  createNewRoomForPlayer = (player: Player) => {
    const newRoom: Room = {
      players: [player],
      id: randomUUID(),
    };

    this.addRoom(newRoom);
  };

  updateRoom = () => {
    console.log('this.rooms: ', this.rooms);

    const clientResponse: ClientResponse = {
      type: 'update_room',
      id: 0,
      data: [],
    };

    const availableRooms = this.rooms
      .filter((room: Room) => RoomService.isRoomAvailableToAddPlayer(room))
      .map((room: Room) => {
        console.log(room);
        return {
          roomId: room.id,
          roomUsers: room.players.map((player) => ({ name: player.name, index: player.id })),
        };
      });

    console.log('availableRooms: ', availableRooms);

    clientResponse.data = availableRooms.length ? availableRooms : [];
    webSocketController.broadcast(clientResponse);
  };
}

export const roomService = new RoomService();
