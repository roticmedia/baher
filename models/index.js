const { Sequelize, DataTypes } = require("sequelize");
const dbConfig = require("../config/database");

const sequelize = new Sequelize(
    dbConfig.DATABASE,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        dialectOptions: {
            connectTimeout: 15000
        },
        pool: {
            max: 100,
            min: 0,
            acquire: 120000,
            idle: 120000,
            evict: 120000
        }
    }
);

const sql = Object.create(null);

sql.sequelize = sequelize;
sql.Sequelize = Sequelize;
sql.types = DataTypes;

sql.question = require("./question")(sequelize, Sequelize, DataTypes);
sql.match = require("./match")(sequelize, Sequelize, DataTypes);
sql.player = require("./player")(sequelize, Sequelize, DataTypes);
sql.category = require("./category")(sequelize, Sequelize, DataTypes);

module.exports = sql;
