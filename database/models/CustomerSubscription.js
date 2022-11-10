'use strict';
const {
  Model
} = require('sequelize');

const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  class CustomerSubscription extends Model {

    static associate(models) {
      this.belongsTo(models.Customer)
      this.belongsTo(models.SubscriptionPlan, {as: "subscription_plan", foreignKey: 'stripe_price_id', targetKey: 'stripe_price_id'})
    }

  };  
  CustomerSubscription.init({
    customer_id: DataTypes.INTEGER,
    stripe_price_id: DataTypes.STRING,
    stripe_subscription_id: DataTypes.STRING,
    payment_gateway: DataTypes.STRING,
    start_payment_date: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('start_payment_date')
        return moment.unix(rawValue).format('MM/DD/YYYY');
      }
    },
    next_payment_date: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('next_payment_date')
        return moment.unix(rawValue).format('MM/DD/YYYY');
      }
    },
    status: {
      type: DataTypes.INTEGER,
      get() {
        const rawValue = this.getDataValue('status')
        let newValue = ''
        switch(rawValue){
          case 1: newValue = 'Active'
            break
          case 2: newValue = 'Inactive'
            break
          case 3: newValue = 'Cancelled'
            break
        }
        return newValue
      }
    },
    created_at_formatted: {
      type: DataTypes.VIRTUAL,
      get() {
        const rawValue = this.getDataValue('createdAt')
        return moment(rawValue).format('MM/DD/YYYY');
      }
    }
  }, {
    sequelize,
    modelName: 'CustomerSubscription',
    tableName: 'customer_subscriptions',
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  });
  return CustomerSubscription;
};