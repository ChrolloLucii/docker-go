import db from '../models/index.js';
const { Project, ProjectMember } = db;

class ProjectRepository {
  async findAllWithMembersByUser(userId) {
    return await Project.findAll({
      where: {},
      include: [
        {
          model: ProjectMember,
          as: 'projectMembers',
          where: { userId },
          required: false
        }
      ],
    });
  }

  async findByIdAndOwner(id, ownerId) {
    return await Project.findOne({ where: { id, ownerId } });
  }

  async create({ name, description, ownerId }) {
    return await Project.create({ name, description, ownerId });
  }

  async update(project, { name, description }) {
    return await project.update({ name, description });
  }

  async delete(project) {
    await project.destroy();
    return { message: 'Project deleted successfully' };
  }
}

export default new ProjectRepository();
