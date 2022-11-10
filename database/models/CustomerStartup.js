'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerStartup extends Model {

    static associate(models) {
      // this.belongsTo(models.User, {as: "user"})
      // this.hasMany(models.CustomerStartupProxy, {as: "CustomerStartup_proxies"})
      // this.hasOne(models.CustomerStartupSubscription, {as: "CustomerStartup_subscription", foreignKey: 'CustomerStartup_id',})
    }
  };  
  CustomerStartup.init({
    customer_id: DataTypes.STRING,
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'CustomerStartup',
    tableName: 'customer_startups',
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  });
  return CustomerStartup;
};