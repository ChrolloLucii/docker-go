import { FaEdit, FaTrash } from "react-icons/fa";
export default function FileList({ files, selectedFile, handleFileSelect, handleFileCreate, handleFileRename, handleFileDelete }) {
 
  return (
    <>
      <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Файлы проекта</h2>
      <button
        onClick={handleFileCreate}
        className="mb-4 px-4 py-2 relative border dark:backdrop-blur-md bg-white/5 border-white/10 rounded-2xl shadow-xl p-6 flex flex-col justify-between overflow-hidden w-full"
      >
        + Новый файл
      </button>
      <ul className="space-y-2">
        {files.map(file => (
          <li key={file.id} className="flex items-center">
            <button
              className={`flex-1 text-left px-3 py-2 rounded-lg ${selectedFile?.id === file.id ? "bg-black text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"}`}
              onClick={() => handleFileSelect(file)}
            >
              {file.name}
            </button>
            <button
                  className="ml-2 text-white hover:text-white/50"
                  title="Переименовать файл"
                  onClick={e => { e.stopPropagation(); handleFileRename(file); }}
                >
                  <FaEdit />
                </button>
                <button
                  className="ml-2 text-red-500 hover:text-red-700"
                  title="Удалить файл"
                  onClick={e => { e.stopPropagation(); handleFileDelete(file); }}
                >
                  <FaTrash />
                </button>
          </li>
        ))}
      </ul>
    </>
  );
}
