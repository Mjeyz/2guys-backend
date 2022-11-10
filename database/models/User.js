'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {

    static associate(models) {
      this.hasMany(models.Customer)
    }

  };  
  User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    user_type_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  });
  return User;
};