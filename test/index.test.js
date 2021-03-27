const request = require('supertest');

const app = require('../app');

describe('SERVER', () => {
  describe('health', () => {
    it('should server runs correctly', (done) => {
      request(app).get('/').expect(200, done);
    });
  });
});

describe('route /', () => {
  describe('GET    -start a game', () => {
    it('should response with status 200', (done) => {
      request(app).get('/').expect(200, done);
    });
  });
  describe('DELETE -finish a game', () => {
    it('should response with status 200', (done) => {
      request(app).delete('/').expect(200, done);
    });
  });
});
