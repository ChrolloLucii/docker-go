import { describe, it, expect, beforeEach, vi } from 'vitest';
import fileRepository from '../fileRepository.js';
import db from '../../models/index.js';

const mockFile = { update: vi.fn(), destroy: vi.fn() };

describe('fileRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('findAllByProject возвращает файлы проекта', async () => {
    vi.spyOn(db.DockerFile, 'findAll').mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const files = await fileRepository.findAllByProject(123);
    expect(db.DockerFile.findAll).toHaveBeenCalledWith({ where: { projectId: 123 }, order: [['position', 'ASC']] });
    expect(files).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('findById возвращает файл по id и projectId', async () => {
    vi.spyOn(db.DockerFile, 'findOne').mockResolvedValue({ id: 1 });
    const file = await fileRepository.findById(1, 123);
    expect(db.DockerFile.findOne).toHaveBeenCalledWith({ where: { id: 1, projectId: 123 } });
    expect(file).toEqual({ id: 1 });
  });

  it('create создаёт новый файл', async () => {
    vi.spyOn(db.DockerFile, 'create').mockResolvedValue({ id: 1 });
    const file = await fileRepository.create(123, { name: 'Dockerfile', content: 'FROM node', position: 0 });
    expect(db.DockerFile.create).toHaveBeenCalledWith({ projectId: 123, name: 'Dockerfile', content: 'FROM node', position: 0 });
    expect(file).toEqual({ id: 1 });
  });

  it('update обновляет файл', async () => {
    mockFile.update.mockResolvedValue({ id: 1, name: 'new' });
    const updated = await fileRepository.update(mockFile, { name: 'new' });
    expect(mockFile.update).toHaveBeenCalledWith({ name: 'new' });
    expect(updated).toEqual({ id: 1, name: 'new' });
  });

  it('delete удаляет файл', async () => {
    mockFile.destroy.mockResolvedValue();
    const result = await fileRepository.delete(mockFile);
    expect(mockFile.destroy).toHaveBeenCalled();
    expect(result).toEqual({ message: 'file Deleted' });
  });

  it('reorder обновляет позиции файлов', async () => {
    vi.spyOn(db.DockerFile, 'update').mockResolvedValue();
    const order = [ { id: 1, position: 0 }, { id: 2, position: 1 } ];
    await fileRepository.reorder(123, order);
    expect(db.DockerFile.update).toHaveBeenCalledTimes(2);
    expect(db.DockerFile.update).toHaveBeenCalledWith({ position: 0 }, { where: { id: 1, projectId: 123 } });
    expect(db.DockerFile.update).toHaveBeenCalledWith({ position: 1 }, { where: { id: 2, projectId: 123 } });
  });
});
