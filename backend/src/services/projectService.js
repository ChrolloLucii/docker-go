import db from '../models/index.js';
const { Project, ProjectMember } = db;
export const projectService = {
async getAllPerUser(userId) {
  return await Project.findAll({
    where: {},
    include: [
      {
        model: ProjectMember,
        as: 'projectMembers', // <-- исправлено!
        where: { userId },
        required: false
      }
    ],
  }).then(projects =>
    projects.filter(
      p => p.ownerId === userId || (p.projectMembers && p.projectMembers.length > 0)
    )
  );
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