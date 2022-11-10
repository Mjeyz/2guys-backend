'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SubscriptionPlan extends Model {

    static associate(models) {
    }
  };  
  SubscriptionPlan.init({
    stripe_price_id: DataTypes.STRING,
    plan_name: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    description: DataTypes.STRING,
    bandwidth_type: DataTypes.STRING,
    bandwidth_limit: DataTypes.STRING,
    subscription_type: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'SubscriptionPlan',
    tableName: 'subscription_plans',
    timestamps: false,
    underscored: true,
    underscoredAll: true,
  });
  return SubscriptionPlan;
};