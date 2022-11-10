'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerPitchApplicant extends Model {

    static associate(models) {
      // this.belongsTo(models.User, {as: "user"})
      // this.hasMany(models.CustomerPitchApplicantProxy, {as: "CustomerPitchApplicant_proxies"})
      // this.hasOne(models.CustomerPitchApplicantSubscription, {as: "CustomerPitchApplicant_subscription", foreignKey: 'CustomerPitchApplicant_id',})
      // this.hasMany(models.CustomerSavedPitch, {as: "customer_saved_pitch"})
    }
  };  
  CustomerPitchApplicant.init({
    customer_id: DataTypes.STRING,
    customer_pitch_id: DataTypes.INTEGER,
    customer_applicant_email: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'CustomerPitchApplicant',
    tableName: 'customer_pitch_applicants',
    timestamps: false,
    underscored: true,
    underscoredAll: true,
  });
  return CustomerPitchApplicant;
};