import { randomUUID } from 'node:crypto';

import { webSocketController } from '../../controllers/webSocket/webSocket.controller.ts';

import type { Player } from '../../types/Player.ts';
import type { Room } from '../../types/Rooms.ts';
import type { ClientResponse } from '../../types/ClientResponse.ts';

const MAX_PLAYERS = 2;

class RoomsService {
  static isRoomAvailableToAddPlayer = (room: Room) => room.players.length < MAX_PLAYERS;

  private rooms: Room[] = [];

  private addRoom = (room: Room) => {
    this.rooms.push(room);
  };

  private getRoomByIndex = (roomIndex: string): Room | undefined =>
    this.rooms.find((room) => String(room.id) === roomIndex);

  addUserToRoomByIndex = (roomIndex: string, player: Player) => {
    const currentRoom: Room | undefined = this.getRoomByIndex(roomIndex);

    if (
      !currentRoom ||
      !RoomsService.isRoomAvailableToAddPlayer(currentRoom) ||
      currentRoom.players.includes(player)
    )
      return;

    currentRoom.players.push(player);
  };

  removePlayerFromRooms = (id: string | number) => {
    this.rooms = this.rooms.map((room: Room) => ({
      id: room.id,
      players: room.players.filter((player) => player.id !== id),
    }));
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
      .filter((room: Room) => RoomsService.isRoomAvailableToAddPlayer(room))
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

export const roomsService = new RoomsService();
