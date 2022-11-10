'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserType extends Model {

    static associate(models) {
    }

  };  
  UserType.init({
    type: DataTypes.STRING,
    description: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'UserType',
    tableName: 'user_types',
    timestamps: false,
    underscored: true,
    underscoredAll: true,
  });
  return UserType;
};