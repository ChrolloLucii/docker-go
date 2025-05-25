import { projectService } from '../services/projectService.js';
import { getRoleStrategy } from '../strategies/roleStrategy.js';

export async function getAllProjectsPerUser(req, res, next) {
    try {
        const userId = req.user.id;
        const projects = await projectService.getAllPerUser(userId);
        res.json(projects);
    }
    catch(err){
        next(err);
    }
}
export async function getProjectById(req, res, next) {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;
        const project = await projectService.getById(projectId, userId);
        res.json(project);
    }
    catch(err){
        next(err);
    }
}
export async function createProject(req, res, next) {
    try {
        const userId = req.user.id;
        const {name, description} = req.body;
        const project = await projectService.create(name, description, userId);
        res.status(201).json(project);
    }
    catch(err){
        next(err);
    }
}
export async function updateProject(req, res, next) {
    try {
        const user = req.user;
        const projectId = req.params.id;
        const {name, description} = req.body;
        const project = await projectService.getById(projectId, user.id);
        const strategy = getRoleStrategy(user.role);
        if (!strategy.canEdit(user, project)) {
            return res.status(403).json({ error: 'Нет прав на редактирование' });
        }
        const updated = await projectService.update(projectId, {name, description}, user.id);
        res.json(updated);
    }
    catch(err){
        next(err);
    }
}
export async function deleteProject(req, res, next) {
    try {
        const user = req.user;
        const projectId = req.params.id;
        const project = await projectService.getById(projectId, user.id);
        const strategy = getRoleStrategy(user.role);
        if (!strategy.canDelete(user, project)) {
            return res.status(403).json({ error: 'Нет прав на удаление' });
        }
        const result = await projectService.remove(projectId, user.id);
        res.json(result);
    }
    catch(err){
        next(err);
    }
}