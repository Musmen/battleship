import { BOARD_SIZE } from '../../common/constants.ts';
import type { Board, BoardCell } from '../../types/Board.ts';

class BoardService {
  private createBoardCell = (x: number, y: number): BoardCell => ({
    position: {
      x,
      y,
    },
    status: null,
    boardShip: null,
  });

  getEmptyBoard = (): Board => {
    let newBoard = new Array(BOARD_SIZE).fill(new Array(BOARD_SIZE).fill('').slice());
    newBoard = newBoard.map((boardRow: BoardCell[], rowIndex) =>
      boardRow.map((_boardCell, columnIndex) => this.createBoardCell(rowIndex, columnIndex))
    );

    return newBoard as Board;
  };
}

export const boardService = new BoardService();
