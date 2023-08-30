const chai = require('chai');
const assert = chai.assert;
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings');

const Solver = require('../controllers/sudoku-solver.js');
let solver = new Solver();
const samplePuzzle = puzzlesAndSolutions[0][0];
suite('Unit Tests', () => {
  test('Logic handles a valid puzzle string of 81 characters', () => {
    const result = solver.validate(samplePuzzle);
    assert.equal(result, true);
  });

  test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', () => {
    const puzzle = samplePuzzle.replace(/\d/, 'a');
    try {
      solver.validate(puzzle);
    } catch (error) {
      assert.equal(error.message, 'Invalid characters in puzzle');
    }
  });

  test('Logic handles a puzzle string that is not 81 characters in length', () => {
    const puzzle = samplePuzzle.slice(1);
    try {
      solver.validate(puzzle);
    } catch (error) {
      assert.equal(error.message, 'Expected puzzle to be 81 characters long');
    }
  });

  test('Logic handles a valid row placement', () => {
    const result = solver.checkRowPlacement(samplePuzzle, 1, 2, 6);
    assert.equal(result, true);
  });

  test('Logic handles an invalid row placement', () => {
    const result = solver.checkRowPlacement(samplePuzzle, 1, 2, 5);
    assert.equal(result, false);
  });

  test('Logic handles a valid column placement', () => {
    const result = solver.checkColPlacement(samplePuzzle, 1, 2, 1);
    assert.equal(result, true);
  });

  test('Logic handles an invalid column placement', () => {
    const result = solver.checkColPlacement(samplePuzzle, 1, 2, 2);
    assert.equal(result, false);
  });

  test('Logic handles a valid region (3x3 grid) placement', () => {
    let result;
    result = solver.checkRegionPlacement(samplePuzzle, 2, 1, 3);
    assert.equal(result, true);
    // check existing valid value placement
    result = solver.checkRegionPlacement(samplePuzzle, 1, 3, 5);
    assert.equal(result, true);
  });

  test('Logic handles an invalid region (3x3 grid) placement', () => {
    const result = solver.checkRegionPlacement(samplePuzzle, 2, 1, 1);
    assert.equal(result, false);
  });

  test('Valid puzzle strings pass the solver', () => {
    assert.doesNotThrow(() => solver.solve(samplePuzzle));
  });

  test('Invalid puzzle strings fail the solver', () => {
    try {
      solver.solve(samplePuzzle.slice(1));
    } catch (error) {
      assert.isOk(error);
    }
  });

  test('Solver returns the expected solution for an incomplete puzzle', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    const result = solver.solve(puzzle);
    assert.equal(result, puzzlesAndSolutions[0][1]);
  });
});
