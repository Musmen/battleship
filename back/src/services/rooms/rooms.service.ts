import { Player } from '../../types/Player.ts';
import type { Room } from '../../types/Rooms.ts';

const MAX_PLAYERS = 2;

class RoomsService {
  static isRoomAvailableToAddPlayer = (room: Room) => room.players.length < MAX_PLAYERS;

  private rooms: Room[] = [];

  private addRoom = (room: Room) => {
    this.rooms.push(room);
  };

  private getCurrentRoom = (roomIndex: number): Room => this.rooms[roomIndex];

  addUserToRoomByIndex = (roomIndex: number, player: Player) => {
    const currentRoom: Room = this.getCurrentRoom(roomIndex);

    if (!RoomsService.isRoomAvailableToAddPlayer(currentRoom)) return;

    currentRoom.players.push(player);
  };

  createNewRoomForPlayer = (player: Player) => {
    const newRoom: Room = {
      players: [player],
    };

    this.addRoom(newRoom);
  };

  getLastRoomIndex = () => this.rooms.length - 1;
}

export const roomsService = new RoomsService();
