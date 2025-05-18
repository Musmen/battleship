import type { Board, BoardCell } from '../../types/Board.ts';

const BOARD_SIZE = 10;

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
      boardRow.map((boardCell, columnIndex) => this.createBoardCell(rowIndex, columnIndex))
    );

    return newBoard as Board;
  };
}

export const boardService = new BoardService();
