import projectRepository from '../repositories/projectRepository.js';

export const projectService = {
  async getAllPerUser(userId) {
    const projects = await projectRepository.findAllWithMembersByUser(userId);
    return projects.filter(
      p => p.ownerId === userId || (p.projectMembers && p.projectMembers.length > 0)
    );
  },

  async getById(id, ownerId) {
    const project = await projectRepository.findByIdAndOwner(id, ownerId);
    if (!project) throw Object.assign(new Error('Project not found'), { status: 404 });
    return project;
  },

  async create(name, description, ownerId) {
    return await projectRepository.create({ name, description, ownerId });
  },

  async update(id, { name, description }, ownerId) {
    const project = await this.getById(id, ownerId);
    return await projectRepository.update(project, { name, description });
  },

  async remove(id, ownerId) {
    const project = await this.getById(id, ownerId);
    return await projectRepository.delete(project);
  }
};