import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fileService } from '../fileService.js'
import db from '../../models/index.js'

const { DockerFile } = db

describe('fileService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('getAllByProject → возвращает упорядоченный список', async () => {
    const fake = [{ id: 'f1' }, { id: 'f2' }]
    vi.spyOn(DockerFile, 'findAll').mockResolvedValue(fake)
    const res = await fileService.getAllByProject('p1')
    expect(DockerFile.findAll).toHaveBeenCalledWith({ where: { projectId: 'p1' }, order: [['position','ASC']] })
    expect(res).toBe(fake)
  })

  it('getById → возвращает файл, или кидает 404', async () => {
    vi.spyOn(DockerFile, 'findOne').mockResolvedValue({ id: 'f1' })
    const ok = await fileService.getById('f1','p1')
    expect(ok).toEqual({ id: 'f1' })

    vi.spyOn(DockerFile, 'findOne').mockResolvedValue(null)
    await expect(fileService.getById('x','p1')).rejects.toMatchObject({ status: 404, message: 'File not found' })
  })

  it('create → создаёт запись', async () => {
    const payload = { projectId:'p1', name:'F', content:'C', position: 0 }
    vi.spyOn(DockerFile, 'create').mockResolvedValue(payload)
    const res = await fileService.create('p1', { name:'F', content:'C', position:0 })
    expect(DockerFile.create).toHaveBeenCalledWith(payload)
    expect(res).toBe(payload)
  })

  it('update → вызывает getById и update', async () => {
    const inst = { update: vi.fn().mockResolvedValue('upd') }
    vi.spyOn(fileService, 'getById').mockResolvedValue(inst)
    const res = await fileService.update('f1','p1',{ name:'X' })
    expect(fileService.getById).toHaveBeenCalledWith('f1','p1')
    expect(inst.update).toHaveBeenCalledWith({ name:'X' })
    expect(res).toBe('upd')
  })

  it('remove → вызывает getById и destroy', async () => {
    const inst = { destroy: vi.fn().mockResolvedValue() }
    vi.spyOn(fileService, 'getById').mockResolvedValue(inst)
    const res = await fileService.remove('f1','p1')
    expect(inst.destroy).toHaveBeenCalled()
    expect(res).toEqual({ message: 'file Deleted' })
  })

  it('reorder → вызывает DockerFile.update для каждого элемента', async () => {
    const arr = [{ id:'a', position:1 },{ id:'b', position:2 }]
    const upd = vi.spyOn(DockerFile, 'update').mockResolvedValue([1])
    await fileService.reorder('p1', arr)
    expect(upd).toHaveBeenCalledTimes(2)
    expect(upd).toHaveBeenCalledWith({ position: 1 }, { where: { id:'a', projectId:'p1' } })
    expect(upd).toHaveBeenCalledWith({ position: 2 }, { where: { id:'b', projectId:'p1' } })
  })
})