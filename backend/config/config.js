require('dotenv').config();  // ← only if you use a .env file

module.exports = {
  development: {
    username: process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASS     || null,
    database: process.env.DB_NAME     || 'docker_go_dev',
    host:     process.env.DB_HOST     || '127.0.0.1',
    port: process.env.DB_PORT || '5432',
    dialect:  'postgres',
  },
  test: {
    username: process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASS     || null,
    database: process.env.DB_NAME_TEST|| 'docker_go_test',
    host:     process.env.DB_HOST     || '127.0.0.1',
    port: process.env.DB_PORT || '5432',
    dialect:  'postgres',
  },
  production: {
    username: process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASS     || null,
    database: process.env.DB_NAME_PROD|| 'docker_go_prod',
    host:     process.env.DB_HOST     || '127.0.0.1',
    port: process.env.DB_PORT || '5432',
    dialect:  'postgres',
  },
};