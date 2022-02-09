'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.record, {
      foreignKey: 'userId',
      as: 'records',
      onDelete: 'CASCADE',
    });
  };
  return User;
};