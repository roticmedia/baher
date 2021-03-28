const request = require('supertest');
const app = require('../app');

describe('route /question', () => {
  describe('POST', () => {
    it('should response with 200 status', (done) => {
      request(app).post('/question').expect(200, done);
    });
  });
  describe('PUT', () => {
    it('should response with 200 status', (done) => {
      request(app).put('/question').expect(200, done);
    });
  });
});
