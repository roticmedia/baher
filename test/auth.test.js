const request = require('supertest');
const jwt = require('jsonwebtoken');

const app = require('../app');
const jwtConfig = require('../config/jsonWebToken');

describe('route /auth', () => {
  describe('GET', () => {
    it('should response with status 200', (done) => {
      request(app).get('/auth').expect(200, done);
    });
    it('should return a valid jwt token', (done) => {
      request(app).get('/auth').end((err, res) => {
        if (err) done(err);
        jwt.verify(res.body.token, jwtConfig.secret, {}, (e) => {
          if (e) done(e);
          else done();
        });
      });
    });
  });
});

describe('auth', () => {
  it('should auth middleware prevent access to protected routes if token not provided', (done) => {
    request(app).get('/auth/test').end((err, res) => {
      if (res.body.error === 'auth error') {
        done();
      } else {
        done('error');
      }
    });
  });
  it('should auth middleware prevent access to protected routes if token is not valid', (done) => {
    request(app).get('/auth/test').set('authorization', 'wrong dsfa').end((err, res) => {
      if (res.body.error === 'auth error') {
        done();
      } else {
        done('error');
      }
    });
  });
  it('should auth middleware let access to protected routes with valid token', (done) => {
    request(app).get('/auth/test').set('authorization', `bearer ${jwtConfig.authToken}`).end((err, res) => {
      if (res.body.error === 'auth error') {
        done('err');
      } else {
        done();
      }
    });
  });
});
