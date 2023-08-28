'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  let solver = new SudokuSolver();

  app.route('/api/check').post((req, res) => {
    try {
      const { puzzle, coordinate, value } = req.body;
      if (!puzzle || !coordinate || !value)
        throw new Error('Required field(s) missing');
      solver.validate(puzzle);
      if (+value < 1 || +value > 9) throw new Error('Invalid value');
      const { row, column } = parseCoordinate(coordinate);
      const conflict = [];
      if (!solver.checkColPlacement(puzzle, row, column, value))
        conflict.push('column');
      if (!solver.checkRowPlacement(puzzle, row, column, value)) {
        conflict.push('row');
      }
      if (!solver.checkRegionPlacement(puzzle, row, column, value)) {
        conflict.push('region');
      }
      res.json({ valid: conflict.length === 0, conflict });
    } catch (e) {
      res.json({ error: e.message });
    }
  });

  app.route('/api/solve').post((req, res) => {
    const puzzle = req.body.puzzle;
    if (!puzzle) {
      return res.json({ error: 'Required field missing' });
    }
    try {
      solver.validate(puzzle);
      const solution = solver.solve(puzzle);
      res.json({ solution });
    } catch (e) {
      return res.json({ error: e.message });
    }
  });
};

const rows = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 9,
};
// this function parses coordinates like 'A3', 'B4', ...
// and returns {row : 1 , column : 3}, {row : 2 , column : 4}, ...
function parseCoordinate(coordinate) {
  if (!/[A-Ia-i]/.test(coordinate)) {
    throw new Error('Invalid coordinate');
  }
  return {
    row: rows[coordinate[0].toLowerCase()],
    column: +coordinate[1],
  };
}
