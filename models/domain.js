"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProDomain extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ProDomain.init(
    {
      serviceCode: DataTypes.STRING,
      domain: DataTypes.TEXT,
    },
    {
      timestamps: false,
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      modelName: "ProDomain",
      sequelize,
    }
  );
  return ProDomain;
};
