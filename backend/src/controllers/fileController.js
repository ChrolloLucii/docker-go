import { fileService } from '../services/fileService.js';

export async function getFiles(req, res, next) {
  try {
    const list = await fileService.getAllByProject(req.params.projectId);
    res.json(list);
  } catch (e) { next(e) }
}

export async function getFile(req, res, next) {
  try {
    const file = await fileService.getById(req.params.id, req.params.projectId);
    res.json(file);
  } catch (e) { next(e) }
}

export async function createFile(req, res, next) {
  try {
    const file = await fileService.create(req.params.projectId, req.body);
    res.status(201).json(file);
  } catch (e) { next(e) }
}

export async function updateFile(req, res, next) {
  try {
    const file = await fileService.update(req.params.id, req.params.projectId, req.body);
    res.json(file);
  } catch (e) { next(e) }
}

export async function deleteFile(req, res, next) {
  try {
    const result = await fileService.remove(req.params.id, req.params.projectId);
    res.json(result);
  } catch (e) { next(e) }
}