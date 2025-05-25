
class RoleStrategy {
  canEdit(user, project) {
    return false;
  }
  canDelete(user, project) {
    return false;
  }
  canInvite(user, project) {
    return false;
  }
}

class AdminStrategy extends RoleStrategy {
  canEdit() { return true; }
  canDelete() { return true; }
  canInvite() { return true; }
}

class EditorStrategy extends RoleStrategy {
  canEdit(user, project) {
    // Проверяем, есть ли у пользователя роль editor в участниках проекта
    return project.projectMembers?.some(m => m.userId === user.id && m.role === 'editor');
  }
  canDelete() { return false; }
  canInvite() { return false; }
}

class UserStrategy extends RoleStrategy {
  canEdit() { return false; }
  canDelete() { return false; }
  canInvite() { return false; }
}

export function getRoleStrategy(role) {
  if (role === 'admin') return new AdminStrategy();
  if (role === 'editor') return new EditorStrategy();
  return new UserStrategy();
}
