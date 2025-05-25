// inviteObserver.js
// Observer for user invitation events

class InviteObserver {
  constructor(io) {
    this.io = io;
  }

  notifyInvite(invite) {
    // invite: { invitedUserId, projectId, inviter, ... }
    this.io.to(`user_${invite.invitedUserId}`).emit('project:invited', invite);
  }
}

export default InviteObserver;