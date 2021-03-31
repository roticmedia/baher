const request = require('supertest');

const app = require('../app');

const jwtConfig = require('../config/jsonWebToken');
const sql = require('../models');

describe('route /question', () => {
  describe('POST', () => {
    it('should response with 200 status', (done) => {
      request(app).post('/question').set('authorization', `bearer ${jwtConfig.authToken}`).expect(200, done);
    });
    it('should return error with incomplete info', (done) => {
      request(app).post('/question').set('authorization', `bearer ${jwtConfig.authToken}`).end(((err, res) => {
        if (err) done(err);
        else if (res.body.status === false) {
          done();
        } else {
          done('err');
        }
      }));
    });
    it('should add question', (done) => {
      request(app).post('/question').set('authorization', `bearer ${jwtConfig.authToken}`)
        .send({
          text: 'سلام',
          difficulty: 1,
          type: 1,
          answer: 'test',
        })
        .end(((err, res) => {
          if (err) done(err);
          else if (res.body.status === true) {
            done();
          } else {
            done('err');
          }
        }));
    });
    it('should not add question', (done) => {
      request(app).post('/question').set('authorization', `bearer ${jwtConfig.authToken}`)
        .send({
          text: 'سلام',
          difficulty: 15,
          type: 1,
        })
        .end(((err, res) => {
          if (err) done(err);
          else if (res.body.status === false) {
            done();
          } else {
            done('err');
          }
        }));
    });
  });
  describe('PUT', () => {
    it('should response with 200 status', (done) => {
      request(app).put('/question').set('authorization', `bearer ${jwtConfig.authToken}`).expect(200, done);
    });
    it('should return error with incomplete info', (done) => {
      request(app).put('/question').set('authorization', `bearer ${jwtConfig.authToken}`).end(((err, res) => {
        if (err) done(err);
        else if (res.body.status === false) {
          done();
        } else {
          done('err');
        }
      }));
    });
    it('should return error with not found id', (done) => {
      request(app).put('/question').set('authorization', `bearer ${jwtConfig.authToken}`)
        .send({
          id: -1,
          text: 'salam',
        })
        .end(((err, res) => {
          if (err) done(err);
          else if (res.body.status === false) {
            done();
          } else {
            done('err');
          }
        }));
    });
    it('should not update question with not valid values', (done) => {
      request(app).put('/question').set('authorization', `bearer ${jwtConfig.authToken}`)
        .send({
          id: 1,
          difficulty: 15,
        })
        .end(((err, res) => {
          if (err) done(err);
          else if (res.body.status === false) {
            done();
          } else {
            done('err');
          }
        }));
    });
    it('should update question', (done) => {
      request(app).put('/question').set('authorization', `bearer ${jwtConfig.authToken}`)
        .send({
          id: 1,
          difficulty: 2,
        })
        .end(((err, res) => {
          if (err) done(err);
          else if (res.body.status === true) {
            done();
          } else {
            done('err');
          }
        }));
    });
  });
});
