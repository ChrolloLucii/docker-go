import db from '../models/index.js';

export default {
  async getAllUsers() {
    return db.User.findAll({ attributes: ['id', 'email', 'role'] });
  },
  async getAllProjects() {
    return db.Project.findAll({ attributes: ['id', 'name', 'ownerId'] });
  },
  async deleteProject(id) {
    const project = await db.Project.findByPk(id);
    if (!project) throw new Error("Проект не найден");
    await project.destroy();
    return true;
  }
};