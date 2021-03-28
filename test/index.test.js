const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');

const sql = require('../models');

describe('SERVER', () => {
  describe('health', () => {
    it('should server runs correctly', (done) => {
      request(app).get('/auth').expect(200, done);
    });
    it.skip('should mongo db runs correctly', (done) => {
      mongoose.connect('mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        done();
      }).catch((err) => {
        done(err);
      });
    });
    it.skip('should my sql connect correctly', (done) => {
      sql.sequelize.authenticate().then(() => {
        done();
      }).catch((err) => {
        done(err);
      });
    });
  });
});

describe('route /', () => {
  describe('GET', () => {
    it('should response with status 200', (done) => {
      request(app).get('/').expect(200, done);
    });
  });
  describe('DELETE', () => {
    it('should response with status 200', (done) => {
      request(app).delete('/').expect(200, done);
    });
  });
});
