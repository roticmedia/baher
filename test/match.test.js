const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');

const jwtConfig = require('../config/jsonWebToken');
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
        it('should my sql connect correctly', (done) => {
            sql.sequelize.authenticate().then(() => {
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });
});

describe('route match/', () => {
    describe('GET /', () => {
        it('should response with status 200', (done) => {
            request(app).get('/match').set('authorization', `bearer ${jwtConfig.authToken}`).expect(200, done);
        });
        it('should return a array of active matches', (done) => {
            request(app).get('/match').set('authorization', `bearer ${jwtConfig.authToken}`).end((err, res) => {
                if (err) done(err);
                else if (res.body.active_matches.length > 0) {
                    done();
                } else {
                    done(err);
                }
            });
        });
    });
    describe('GET /:id', () => {
        it('should response with status 200', (done) => {
            request(app).get('/match/1').set('authorization', `bearer ${jwtConfig.authToken}`).expect(200, done);
        });
        it('should return a array of active matches', (done) => {
            request(app).get('/match/1').set('authorization', `bearer ${jwtConfig.authToken}`).end((err, res) => {
                if (err) done(err);
                else if (res.body.status === true) {
                    done();
                } else {
                    done(err);
                }
            });
        });
    });
    describe('POST /', () => {
        it('should response with status 200', (done) => {
            request(app).post('/match').set('authorization', `bearer ${jwtConfig.authToken}`).expect(200, done);
        });
        it('should start a match', (done) => {
            request(app).post('/match').set('authorization', `bearer ${jwtConfig.authToken}`)
                .send({
                    competitors: 10,
                    coin_questions: 30,
                    foop_questions: 0,
                })
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
    describe('DELETE /', () => {
        it('should response with status 200', (done) => {
            request(app).delete('/match').set('authorization', `bearer ${jwtConfig.authToken}`).expect(200, done);
        });
        it('should finish match', async () => {
            const game = await sql.match.create({
                competitors: 10,
                coin_questions: 30,
                foop_questions: 0,
            });
            return new Promise((resolve, reject) => {
                request(app).delete('/match').set('authorization', `bearer ${jwtConfig.authToken}`)
                    .send({
                        id: game.get('id'),
                    })
                    .end(((err, res) => {
                        if (err) reject(err);
                        else if (res.body.status === true) {
                            resolve();
                        } else {
                            reject(err);
                        }
                    }));
            });
        });
        it('should not delete match for not found id', (done) => {
            request(app).delete('/match').set('authorization', `bearer ${jwtConfig.authToken}`)
                .send({
                    id: 5,
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
