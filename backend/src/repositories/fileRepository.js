import db from '../models/index.js';
const { DockerFile } = db;

class FileRepository {
  async findAllByProject(projectId) {
    return DockerFile.findAll({ where: { projectId }, order: [['position', 'ASC']] });
  }

  async findById(id, projectId) {
    return DockerFile.findOne({ where: { id, projectId } });
  }

  async create(projectId, { name, content, position }) {
    return DockerFile.create({ projectId, name, content, position });
  }

  async update(file, data) {
    return file.update(data);
  }

  async delete(file) {
    await file.destroy();
    return { message: 'file Deleted' };
  }

  async reorder(projectId, order) {
    return Promise.all(order.map(o =>
      DockerFile.update({ position: o.position }, { where: { id: o.id, projectId } })
    ));
  }
}

export default new FileRepository();
