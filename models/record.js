'use strict';
module.exports = (sequelize, DataTypes) => {
  const Record = sequelize.define('record', {
    from_date: DataTypes.DATE,
    distance: DataTypes.FLOAT,
    to_date: DataTypes.DATE,
    time: DataTypes.INTEGER,
    speed:DataTypes.FLOAT,
    userId: DataTypes.INTEGER

  }, {});
  Record.associate = function(models) {
    // associations can be defined here
    Record.belongsTo(models.user, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE',
    })
  };
  return Record;
};
