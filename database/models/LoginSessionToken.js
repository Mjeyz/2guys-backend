'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LoginSessionToken extends Model {

    static associate(models) {
    }

  };  
  LoginSessionToken.init({
    user_id: DataTypes.INTEGER,
    token: DataTypes.STRING,
    expire_at: DataTypes.STRING,
    stripe_id: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'LoginSessionToken',
    tableName: 'login_session_tokens',
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  });
  return LoginSessionToken;
};