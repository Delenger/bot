const { database } = require("./index");

const connection = {
  username: database.username,
  password: database.password,
  database: database.database,
  dialect: "mysql",
  timezone: "+03:00",
  dialectOptions: {
    charset: "utf8mb4",
  },
  logging: false,
  // host: "85.193.88.74",
  // port: 3306
};

module.exports = {
  development: connection,
  test: connection,
  production: connection,
};
