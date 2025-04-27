import db from '../models/index.js';
const { DockerFile } = db;

export const fileService = {
    async getAllByProject(projectId) {

        return await DockerFile.findAll({ where: { projectId }, order: [['position', 'ASC']]
         });
    },
    async getById(id, projectId) {
        const file = await DockerFile.findOne({ where: { id, projectId } });
        if (!file) throw Object.assign(new Error('File not found'), { status: 404 });
        return file;
    },
    async create(projectId, { name, content, position }) {
        return await DockerFile.create({ projectId, name, content, position });
      },
    async update(id, projectId, data){
        const file = await this.getById(id, projectId);
        return await file.update(data);
    },
    async remove(id, projectId){
        const file = await this.getById(id, projectId);
        await file.destroy();
        return {message: 'file Deleted'};
    },
    async reorder(projectId, order){
        return Promise.all(order.map(o =>
            DockerFile.update({position: o.position}, {where : {id: o.id, projectId}})
        ));
    }
};