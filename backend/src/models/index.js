import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Sequelize from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || 'development';
import configObj from '../config/config.cjs';
const config = configObj[env];
const db = {};

const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize(config.database, config.username, config.password, config);

const files = fs
  .readdirSync(__dirname)
  .filter(file => file.endsWith('.js') && file !== 'index.js');

for (const file of files) {
  const { default: modelDef } = await import(pathToFileURL(path.join(__dirname, file)).href);
  const model = modelDef(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
export const { User, Project, DockerFile, ProjectVersion, ProjectMember } = db;
export default db;