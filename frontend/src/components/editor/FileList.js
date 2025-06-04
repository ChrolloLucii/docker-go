import { FaEdit, FaTrash } from "react-icons/fa";

export default function FileList({ 
  files, 
  selectedFile, 
  handleFileSelect, 
  handleFileCreate, 
  handleFileRename, 
  handleFileDelete 
}) {
  return (
    <>
      <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
        Файлы проекта
      </h2>
      
      <button
        onClick={handleFileCreate}
        className="mb-4 px-4 py-2 relative border dark:backdrop-blur-md bg-white/5 border-white/10 rounded-2xl shadow-xl p-6 flex flex-col justify-between overflow-hidden w-full hover:bg-white/10 transition-all duration-200"
      >
        + Новый файл
      </button>
      
      <ul className="space-y-2">
        {files.length === 0 ? (
          <li className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📄</div>
            <p>Нет файлов</p>
            <p className="text-sm">Создайте первый файл</p>
          </li>
        ) : (
          files.map(file => (
            <li key={file.id} className="flex items-center group">
              <button
                className={`flex-1 text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                  selectedFile?.id === file.id 
                    ? "bg-black text-white" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                onClick={() => handleFileSelect(file)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-60">📄</span>
                  {file.name}
                </div>
              </button>
              
              <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  className="p-1 text-white hover:text-white/50 bg-gray-600 hover:bg-gray-500 rounded transition-colors duration-200"
                  title="Переименовать файл"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleFileRename(file); 
                  }}
                >
                  <FaEdit size={12} />
                </button>
                
                <button
                  className="p-1 text-red-400 hover:text-red-300 bg-red-600/20 hover:bg-red-600/40 rounded transition-colors duration-200"
                  title="Удалить файл"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleFileDelete(file); 
                  }}
                >
                  <FaTrash size={12} />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </>
  );
}