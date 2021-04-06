const request = require('supertest');

const app = require('../app');

const jwtConfig = require('../config/jsonWebToken');
const sql = require('../models');

describe('route /game', () => {
    describe('POST /', () => {
        it('should response with status 200', (done) => {
            request(app).post('/game').set('authorization', `bearer ${jwtConfig.authToken}`).expect(200, done);
        });
        it('should start a match', (done) => {
            request(app).post('/game').set('authorization', `bearer ${jwtConfig.authToken}`)
                .send({
                    competitors: 10,
                    coin_questions: 30,
                    foop_questions: 0,
                })
                .end(((err, res) => {
                    if (err) done(err);
                    else if (res.body.status) {
                        done();
                    } else {
                        done(err);
                    }
                }));
        });
    });
    describe('GET /', () => {
        it('should response with status 200', (done) => {
            request(app).get('/game').set('authorization', `bearer ${jwtConfig.authToken}`).expect(200, done);
        });
        it('should return correct matches', (done) => {
            request(app).get('/game').set('authorization', `bearer ${jwtConfig.authToken}`)
                .end(((err, res) => {
                    if (err) done(err);
                    else if (res.body.status === true) {
                        done();
                    } else {
                        done(err);
                    }
                }));
        });
    });
});
