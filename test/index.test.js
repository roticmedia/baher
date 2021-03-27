const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');

const sql = require('../models');

describe('SERVER', () => {
  describe('health', () => {
    it('should server runs correctly', (done) => {
      request(app).get('/').expect(200, done);
    });
    it('should mongo db runs correctly', (done) => {
      mongoose.connect('mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        done();
      }).catch((err) => {
        done(err);
      });
    });
    it('should my sql connect correctly', (done) => {
      sql.sequelize.authenticate().then(() => {
        done();
      }).catch((err) => {
        done(err);
      });
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
