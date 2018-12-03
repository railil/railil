require('dotenv').config();
module.exports = {

  development: {
    client: 'postgresql',
    connection: process.env.DB_CONNECTION_DEVELOPMENT,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: process.env.DB_CONNECTION_DEVELOPMENT,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
