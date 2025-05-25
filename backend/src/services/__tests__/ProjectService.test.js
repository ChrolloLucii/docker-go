import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { projectService } from '../projectService.js'
import db from '../../models/index.js'

const { Project, ProjectMember } = db

describe('projectService', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('getAllPerUser → возвращает только доступные проекты', async () => {
    const all = [
      { ownerId: 'u1', projectMembers: [] },
      { ownerId: 'x', projectMembers: [{ userId:'u1' }] },
      { ownerId: 'x', projectMembers: [] }
    ]
    vi.spyOn(Project, 'findAll').mockResolvedValue(all)
    const res = await projectService.getAllPerUser('u1')
    expect(res).toEqual([ all[0], all[1] ])
    expect(Project.findAll).toHaveBeenCalledWith({
      where: {},
      include: [{ model: ProjectMember, as: 'projectMembers', where: { userId:'u1' }, required:false }]
    })
  })

  it('getById → возвращает или кидает 404', async () => {
    vi.spyOn(Project, 'findOne').mockResolvedValue({ id:'p1', ownerId:'u1' })
    await expect(projectService.getById('p1','u1')).resolves.toMatchObject({ id:'p1' })

    vi.spyOn(Project, 'findOne').mockResolvedValue(null)
    await expect(projectService.getById('x','u1'))
      .rejects.toMatchObject({ status: 404, message: 'Project not found' })
  })

  it('create → вызывает Project.create', async () => {
    const created = { id:'p1', name:'N', description:'D', ownerId:'u1' }
    vi.spyOn(Project, 'create').mockResolvedValue(created)
    const res = await projectService.create('N','D','u1')
    expect(Project.create).toHaveBeenCalledWith({ name:'N', description:'D', ownerId:'u1' })
    expect(res).toBe(created)
  })

  it('update → вызывает getById и update', async () => {
    const inst = { update: vi.fn().mockResolvedValue('upd') }
    vi.spyOn(projectService, 'getById').mockResolvedValue(inst)
    const res = await projectService.update('p1',{ name:'X', description:'Y' },'u1')
    expect(projectService.getById).toHaveBeenCalledWith('p1','u1')
    expect(inst.update).toHaveBeenCalledWith({ name:'X', description:'Y' })
    expect(res).toBe('upd')
  })

  it('remove → вызывает getById и destroy', async () => {
    const inst = { destroy: vi.fn().mockResolvedValue() }
    vi.spyOn(projectService, 'getById').mockResolvedValue(inst)
    const res = await projectService.remove('p1','u1')
    expect(inst.destroy).toHaveBeenCalled()
    expect(res).toEqual({ message: 'Project deleted successfully' })
  })
})