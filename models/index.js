const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const sequelize = new Sequelize(dbConfig.DATABASE, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
});

const db = Object.create(null);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
