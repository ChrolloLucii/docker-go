import db from '../models/index.js';
const { Project } = db;
export const projectService = {
    async getAllPerUser(ownerId) {
      return await Project.findAll({ where: { ownerId } });
    },
  
    async getById(id, ownerId) {
      const project = await Project.findOne({ where: { id, ownerId } });
      if (!project) throw Object.assign(new Error('Project not found'), { status: 404 });
      return project;
    },
  
    async create(name, description, ownerId) {
      return await Project.create({ name, description, ownerId });
    },
  
    async update(id, { name, description }, ownerId) {
      const project = await this.getById(id, ownerId);
      return await project.update({ name, description });
    },
  
    async remove(id, ownerId) {
      const project = await this.getById(id, ownerId);
      await project.destroy();
      return { message: 'Project deleted successfully' };
    }
  };