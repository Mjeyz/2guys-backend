'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerSuccessfulPartner extends Model {

    static associate(models) {
      this.belongsTo(models.Customer, {as: 'customer_partner', foreignKey: 'customer_partner_id', })
      this.belongsTo(models.CustomerPitch, {as: 'customer_pitch', foreignKey: 'customer_pitch_id', })
    }
  };  
  CustomerSuccessfulPartner.init({
    customer_id: DataTypes.STRING,
    customer_pitch_id: DataTypes.INTEGER,
    customer_partner_id: DataTypes.STRING,
    status: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'CustomerSuccessfulPartner',
    tableName: 'customer_successful_partners',
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  });
  return CustomerSuccessfulPartner;
};