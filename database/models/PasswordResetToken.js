'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PasswordResetToken extends Model {
    static associate(models) {

    }
  };  
  PasswordResetToken.init({
    customer_id: DataTypes.STRING,
    token: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'PasswordResetToken',
    tableName: 'password_reset_tokens',
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  });
  return PasswordResetToken;
};