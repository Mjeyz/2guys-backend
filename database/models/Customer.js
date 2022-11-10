'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {

    static associate(models) {
      this.hasMany(models.CustomerOccupation, {as: "customer_occupations", foreignKey: 'customer_id'})
      this.hasMany(models.CustomerStartup, {as: "customer_startups", foreignKey: 'customer_id'})
      this.hasMany(models.CustomerPitch, {as: "customer_pitches", foreignKey: 'customer_id'})
    }
  };  
  Customer.init({
    user_id: DataTypes.INTEGER,
    customer_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    // stripe_id: DataTypes.STRING,
    fish_type: DataTypes.STRING,
    trial: DataTypes.BOOLEAN,
    post_limit: DataTypes.INTEGER,
    post_applicant_limit: DataTypes.INTEGER,
    partner_applicant_limit: DataTypes.INTEGER,
    current_month_total_post: {
      type:  DataTypes.VIRTUAL,
      get(){
        return this.getDataValue('current_month_total_post')
      }
    },
    name: DataTypes.STRING,
    age: DataTypes.STRING,
    email: DataTypes.STRING,
    gender: DataTypes.STRING,
    profile_image_url: {
      type:  DataTypes.TEXT,
      get(){
        const rawValue = this.getDataValue('profile_image_url')

        if(rawValue === null){
          return `${process.env.WEB_APP_BASE_URL}avatar.png`
        } 

        return `${process.env.BASE_URL}public/${rawValue}`
      }
    },
    // status: {
    //   type: DataTypes.INTEGER,
    //   get() {
    //     const rawValue = this.getDataValue('status')
    //    return rawValue !== 0 ? "Active" : "Inactive"
    //   }
    // }
  }, {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  });
  return Customer;
};