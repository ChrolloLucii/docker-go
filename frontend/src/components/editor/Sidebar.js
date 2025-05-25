import InviteForm from './InviteForm';
import FileList from './FileList';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
export default function Sidebar({
  sidebarOpen, setSidebarOpen,
  inviteUsername, setInviteUsername,
  inviteError, inviteSuccess,
  handleInvite,
  files, selectedFile, handleFileSelect,
  handleFileCreate, handleFileRename, handleFileDelete
}) {
  return (
   <aside
  className={`transition-all duration-300 ${sidebarOpen ? "w-64" : "w-12"} border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col relative bg-white/70 dark:bg-black/60 backdrop-blur-md shadow-lg`}
  style={{ minWidth: sidebarOpen ? "16rem" : "3rem" }}
>
      <button
  className="absolute -right-4 top-6 z-10 bg-black dark:bg-white text-white dark:text-black rounded-full w-8 h-8 flex items-center justify-center shadow hover:scale-110 transition"
  onClick={() => setSidebarOpen((v) => !v)}
  title={sidebarOpen ? "Свернуть" : "Развернуть"}
>
  {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </button>
{sidebarOpen && (
  <>
    <InviteForm
            inviteUsername={inviteUsername}
            setInviteUsername={setInviteUsername}
            inviteError={inviteError}
            inviteSuccess={inviteSuccess}
            handleInvite={handleInvite}
          />
          <hr className="my-4 border-gray-200 dark:border-gray-700" />
          <FileList
            files={files}
            selectedFile={selectedFile}
            handleFileSelect={handleFileSelect}
            handleFileCreate={handleFileCreate}
            handleFileRename={handleFileRename}
            handleFileDelete={handleFileDelete}
          />
        </>
      )}
    </aside>
  );
}
