export default function InviteForm({ inviteUsername, setInviteUsername, inviteError, inviteSuccess, handleInvite }) {
  return (
    <form
      onSubmit={handleInvite}
      className="mb-4 flex flex-col gap-2 items-stretch backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-xl p-4 max-w-full"
      style={{ minWidth: 0 }}
    >
      <label htmlFor="invite-username" className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 pl-1">
        Пригласить по нику
      </label>
      <input
        id="invite-username"
        type="text"
        placeholder="Ник пользователя"
        value={inviteUsername}
        onChange={e => setInviteUsername(e.target.value)}
        className="border-2 border-blue-200 dark:border-white/10 rounded-xl px-3 py-2 text-base bg-white/80 dark:bg-black/60 focus:outline-none focus:ring-2 focus:ring-black transition font-semibold placeholder-gray-400 dark:placeholder-gray-500 w-full"
        required
        style={{ minWidth: 0 }}
      />
      <button
        type="submit"
        className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r dark:bg-white font-bold px-5 py-2 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black dark:text-black focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed w-full"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path d="M2 10h12M10 2l8 8-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Пригласить
      </button>
      {inviteError && <div className="text-red-500 mt-1 text-sm font-medium break-words">{inviteError}</div>}
      {inviteSuccess && <div className="text-green-600 mt-1 text-sm font-medium break-words">{inviteSuccess}</div>}
    </form>
  );
}