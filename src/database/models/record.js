'use strict';
module.exports = (sequelize, DataTypes) => {
  const Record = sequelize.define('Record', {
    from_date: DataTypes.DATE,
    distance: DataTypes.FLOAT,
    to_date: DataTypes.DATE,
    time: DataTypes.STRING,
    speed:DataTypes.FLOAT,
    userId: DataTypes.INTEGER

  }, {});
  Record.associate = function(models) {
    // associations can be defined here
    Record.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE',
    })
  };
  return Record;
};

// database/models/post.js
