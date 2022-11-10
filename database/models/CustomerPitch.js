'use strict';
const {
  Model
} = require('sequelize')

const moment = require("moment")

module.exports = (sequelize, DataTypes) => {
  class CustomerPitch extends Model {

    static associate(models) {
      this.hasMany(models.CustomerPitchAssessmentQuestion, {as: "customer_pitch_assessment_questions", foreignKey: "customer_pitch_id"})
      this.belongsTo(models.Customer, {as: "customer", foreignKey: "customer_id"})
      this.hasOne(models.CustomerPitchApplyValidity, {as: "customer_pitch_apply_validity", foreignKey: "customer_pitch_id"})
    }
  };  
  CustomerPitch.init({
    customer_id: DataTypes.STRING,
    report_count: DataTypes.INTEGER,
    pitch_title: DataTypes.STRING,
    idea_description: DataTypes.TEXT,
    location: DataTypes.TEXT,
    potential_yearly_revenue: {
      type: DataTypes.TEXT,
      get() {
        let potentialRev = this.getDataValue('potential_yearly_revenue')
        let val = potentialRev.split("-")
        let newVal = ""

        const transform =  (value) => {
          const num = Number(value)
          const absNum = Math.abs(num)
          const sign = Math.sign(num)
          const numLength = Math.round(absNum).toString().length
          const symbol = ['K', 'M', 'B', 'T', 'Q']
          const symbolIndex = Math.floor((numLength - 1) / 3) - 1
          const abbrv = symbol[symbolIndex] || symbol[symbol.length - 1]
          let divisor = 0
          if (numLength > 15) divisor = 1e15
          else if (numLength > 12) divisor = 1e12
          else if (numLength > 9) divisor = 1e9
          else if (numLength > 6) divisor = 1e6
          else if (numLength > 3) divisor = 1e3
          else return num
          return `${((sign * absNum) / divisor).toFixed(divisor && 1)}${abbrv}`
        }

        if(potentialRev === "") {
          return potentialRev
        }

        if(val[0] !== ""){
          newVal += transform(val[0])
        }

        if(val[1] !== ""){
          newVal += ` - ${transform(val[1])}`
        }

        if(newVal.split("-")[0].trim() === "0"){
          return newVal.split("-")[1]
        }

        return newVal
      },
    },
    status: DataTypes.TEXT,
    can_apply: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('can_apply') === undefined ? true : this.getDataValue('can_apply')
      },
    },
    date_short: {
      type: DataTypes.VIRTUAL,
      get() {
        const rawValue = this.getDataValue('createdAt')
        return moment(rawValue).format('MM/DD/YYYY');
      }
    },
    from_now: {
      type: DataTypes.VIRTUAL,
      get() {
        const rawValue = this.getDataValue('createdAt')

        moment.updateLocale('en', {
          relativeTime: {
            future : 'in %s',
            past   : '%s ago',
            s  : function (number, withoutSuffix) {
              return withoutSuffix ? 'now' : 'a few seconds';
            },
            m  : '1m',
            mm : '%dm',
            h  : '1h',
            hh : '%dh',
            d  : '1d',
            dd : '%dd',
            M  : '1mo',
            MM : '%dmo',
            y  : '1y',
            yy : '%dy'
          }
        })
        
        return moment(rawValue).fromNow(true)
      }
    },
  }, {
    sequelize,
    modelName: 'CustomerPitch',
    tableName: 'customer_pitches',
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  });
  return CustomerPitch;
};