const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/database');

const sequelize = new Sequelize(dbConfig.DATABASE, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  logging: false,
});

const sql = Object.create(null);

sql.sequelize = sequelize;
sql.Sequelize = Sequelize;
sql.types = DataTypes;

sql.question = require('./question')(sequelize, Sequelize, DataTypes);
sql.game = require('./game')(sequelize, Sequelize, DataTypes);
sql.q = require('./q')(sequelize, Sequelize, DataTypes);

module.exports = sql;
