'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerOccupation extends Model {

    static associate(models) {
      this.belongsTo(models.Customer, {as: "customer_occupations", targetKey: 'customer_id', foreignKey: 'customer_id'})
      // this.hasMany(models.CustomerOccupationProxy, {as: "CustomerOccupation_proxies"})
      // this.hasOne(models.CustomerOccupationSubscription, {as: "CustomerOccupation_subscription", foreignKey: 'CustomerOccupation_id',})
    }
  };  
  CustomerOccupation.init({
    customer_id: DataTypes.STRING,
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'CustomerOccupation',
    tableName: 'customer_occupations',
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  });
  return CustomerOccupation;
};