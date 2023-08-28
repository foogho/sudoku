class SudokuSolver {
  validate(puzzleString) {
    if (!/^(\d|\.)+$/.test(puzzleString))
      throw new Error('Invalid characters in puzzle');
    if (puzzleString.length !== 81)
      throw new Error('Expected puzzle to be 81 characters long');
    return true;
  }

  checkRowPlacement(puzzleString, rowNumber, column, value) {
    const row = puzzleString.slice((rowNumber - 1) * 9, rowNumber * 9);
    return !row
      .slice(0, column - 1)
      .concat(row.slice(column))
      .includes(value);
  }

  checkColPlacement(puzzleString, row, colNumber, value) {
    let column = '';
    for (let i = 0; i < 9; i++) {
      column += puzzleString[9 * i + colNumber - 1];
    }
    return !column
      .slice(0, row - 1)
      .concat(column.slice(row))
      .includes(value);
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const cellIdx = this.getIndex(row, column);
    const firstGridCellIdx = this.getIndex(
      row - ((row - 1) % 3),
      column - ((column - 1) % 3)
    );
    let grid = '';
    for (let i = firstGridCellIdx; i < firstGridCellIdx + 20; i += 9) {
      if (i === cellIdx) continue;
      for (let j = 0; j < 3; j++) grid += puzzleString[i + j];
    }
    return !grid.includes(value);
  }

  getIndex(row, column) {
    return (row - 1) * 9 + (column - 1);
  }

  solve(puzzleString) {
    while (puzzleString.includes('.')) {
      for (let i = 0; i < 81; i++) {
        if (puzzleString[i] !== '.') continue;
        const row = Math.ceil((i + 1) / 9),
          column = i + 1 - (row - 1) * 9;
        let candidates = [];
        for (let j = 1; j < 10; j++) {
          if (
            this.checkRowPlacement(puzzleString, row, column, j) &&
            this.checkColPlacement(puzzleString, row, column, j) &&
            this.checkRegionPlacement(puzzleString, row, column, j)
          ) {
            candidates.push(j);
          }
        }
        if (candidates.length === 0)
          throw new Error('Puzzle cannot be solved');
        if (candidates.length > 1) continue;
        puzzleString =
          puzzleString.substring(0, i) +
          candidates[0] +
          puzzleString.substring(i + 1);
      }
    }
    return puzzleString;
  }
}

module.exports = SudokuSolver;
