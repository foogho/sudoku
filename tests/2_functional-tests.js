const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  const requester = chai.request(server).keepOpen();
  const puzzle = puzzlesAndSolutions[0][0];
  test('Solve a puzzle with valid puzzle string: POST request to /api/solve', (done) => {
    requester
      .post('/api/solve')
      .send({ puzzle })
      .end((err, res) => {
        assert.equal(res.body.solution, puzzlesAndSolutions[0][1]);
        done();
      });
  });
  test('Solve a puzzle with missing puzzle string: POST request to /api/solve', (done) => {
    requester.post('/api/solve').end((err, res) => {
      assert.equal(res.body.error, 'Required field missing');
      done();
    });
  });
  test('Solve a puzzle with invalid characters: POST request to /api/solve', (done) => {
    const puzzleWithInvalidCharacters =
      puzzle.substring(0, 10) + 'X' + puzzle.substring(11);
    requester
      .post('/api/solve')
      .send({ puzzle: puzzleWithInvalidCharacters })
      .end((err, res) => {
        assert.equal(res.body.error, 'Invalid characters in puzzle');
        done();
      });
  });
  suite(
    'Solve a puzzle with incorrect length: POST request to /api/solve',
    () => {
      test('Puzzle with length lower than 81', (done) => {
        const puzzleLessThan81 = puzzle.slice(1);
        requester
          .post('/api/solve')
          .send({ puzzle: puzzleLessThan81 })
          .end((err, res) => {
            assert.equal(
              res.body.error,
              'Expected puzzle to be 81 characters long'
            );
            done();
          });
      });
      test('Puzzle with length greater than 81', (done) => {
        const puzzleGreaterThan81 = puzzle.concat('4');
        requester
          .post('/api/solve')
          .send({
            puzzle: puzzleGreaterThan81,
          })
          .end((err, res) => {
            assert.equal(
              res.body.error,
              'Expected puzzle to be 81 characters long'
            );
            done();
          });
      });
    }
  );
  test('Solve a puzzle that cannot be solved: POST request to /api/solve', (done) => {
    const unsolvablePuzzle =
      '115..2284..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    requester
      .post('/api/solve')
      .send({
        puzzle: unsolvablePuzzle,
      })
      .end((err, res) => {
        assert.equal(res.body.error, 'Puzzle cannot be solved');
        done();
      });
  });
  test('Check a puzzle placement with all fields: POST request to /api/check', (done) => {
    const checkPayload = {
      puzzle,
      coordinate: 'A2',
      value: '3',
    };
    requester
      .post('/api/check')
      .send(checkPayload)
      .end((err, res) => {
        assert.equal(res.body.valid, true);
        done();
      });
  });
  test('Check a puzzle placement with single placement conflict: POST request to /api/check', (done) => {
    const checkPayload = { puzzle, coordinate: 'A2', value: '4' };
    requester
      .post('/api/check')
      .send(checkPayload)
      .end((err, res) => {
        assert.equal(res.body.valid, false);
        assert.deepEqual(res.body.conflict.length, 1);
        assert.deepEqual(res.body.conflict[0], 'row');
        done();
      });
  });
  test('Check a puzzle placement with multiple placement conflicts: POST request to /api/check', (done) => {
    const checkPayload = { puzzle, coordinate: 'A2', value: '1' };
    requester
      .post('/api/check')
      .send(checkPayload)
      .end((err, res) => {
        assert.equal(res.body.valid, false);
        assert.equal(res.body.conflict.length, 2);
        assert.equal(res.body.conflict.includes('row'), true);
        assert.equal(res.body.conflict.includes('region'), true);
        done();
      });
  });
  test('Check a puzzle placement with all placement conflicts: POST request to /api/check', (done) => {
    const checkPayload = { puzzle, coordinate: 'A2', value: '2' };
    requester
      .post('/api/check')
      .send(checkPayload)
      .end((err, res) => {
        assert.equal(res.body.valid, false);
        assert.equal(res.body.conflict.length, 3);
        assert.equal(res.body.conflict.includes('row'), true);
        assert.equal(res.body.conflict.includes('column'), true);
        assert.equal(res.body.conflict.includes('region'), true);
        done();
      });
  });
  test('Check a puzzle placement with missing required fields: POST request to /api/check', (done) => {
    const invalidCheckPayload = { coordinate: 'A2', value: '3' };
    requester
      .post('/api/check')
      .send(invalidCheckPayload)
      .end((err, res) => {
        assert.equal(res.body.error, 'Required field(s) missing');
        done();
      });
  });
  test('Check a puzzle placement with invalid characters: POST request to /api/check', (done) => {
    const checkPayload = {
      puzzle: puzzle.substring(0, 5) + 'X' + puzzle.substring(6),
      coordinate: 'A2',
      value: '3',
    };
    requester
      .post('/api/check')
      .send(checkPayload)
      .end((err, res) => {
        assert.equal(res.body.error, 'Invalid characters in puzzle');
        done();
      });
  });
  test('Check a puzzle placement with incorrect length: POST request to /api/check', (done) => {
    const checkPayload = {
      puzzle: puzzle.concat('5'),
      coordinate: 'A2',
      value: '3',
    };
    requester
      .post('/api/check')
      .send(checkPayload)
      .end((err, res) => {
        assert.equal(
          res.body.error,
          'Expected puzzle to be 81 characters long'
        );
        done();
      });
  });
  test('Check a puzzle placement with invalid placement coordinate: POST request to /api/check', (done) => {
    const checkPayload = { puzzle, coordinate: 'Z4', value: '4' };
    requester
      .post('/api/check')
      .send(checkPayload)
      .end((err, res) => {
        assert.equal(res.body.error, 'Invalid coordinate');
        done();
      });
  });
  test('Check a puzzle placement with invalid placement value: POST request to /api/check', (done) => {
    const checkPayload = { puzzle, coordinate: 'A2', value: '25' };
    requester
      .post('/api/check')
      .send(checkPayload)
      .end((err, res) => {
        assert.equal(res.body.error, 'Invalid value');
        done();
      });
  });
});
