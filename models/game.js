module.exports = (sequelize, Sequelize, types) => sequelize.define('Game', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  status: types.TINYINT,
}, {
  underscored: true,
});
