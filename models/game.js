module.exports = (sequelize, Sequelize, types) => sequelize.define('Game', {
  status: {
    type: types.TINYINT,
    defaultValue: 0,
  },
}, {
  underscored: true,
});
