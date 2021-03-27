const request = require('supertest');
const app = require('../app');

describe('route /question', () => {
  describe('POST   -add a question', () => {
    it('should response with 200 status', (done) => {
      request(app).post('/question').expect(200, done);
    });
  });
  describe('PUT    -update a question', () => {
    it('should response with 200 status', (done) => {
      request(app).put('/question').expect(200, done);
    });
  });
});
