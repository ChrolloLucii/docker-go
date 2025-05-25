import fileRepository from '../repositories/fileRepository.js';

export const fileService = {
    async getAllByProject(projectId) {
        return await fileRepository.findAllByProject(projectId);
    },
    async getById(id, projectId) {
        const file = await fileRepository.findById(id, projectId);
        if (!file) throw Object.assign(new Error('File not found'), { status: 404 });
        return file;
    },
    async create(projectId, data) {
        return await fileRepository.create(projectId, data);
    },
    async update(id, projectId, data){
        const file = await this.getById(id, projectId);
        return await fileRepository.update(file, data);
    },
    async remove(id, projectId){
        const file = await this.getById(id, projectId);
        return await fileRepository.delete(file);
    },
    async reorder(projectId, order){
        return await fileRepository.reorder(projectId, order);
    }
};