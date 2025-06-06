import Link from "next/link";
import { FaTrash } from "react-icons/fa";
import { HiOutlinePencil } from "react-icons/hi";
import axios from "axios";

export default function ProjectCard({ project, onDelete, onRename }) {
  const handleDelete = async () => {
    if (confirm('Удалить проект? Это действие необратимо.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/projects/${project.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (onDelete) onDelete(project.id);
      } catch (e) {
        alert(e.response?.data?.error || e.message || 'Ошибка удаления проекта');
      }
    }
  };

  const handleRename = async () => {
    const newName = prompt("Новое имя проекта:", project.name);
    if (!newName || newName === project.name) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `/api/projects/${project.id}`,
        { name: newName, description: project.description },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (onRename) onRename(res.data);
    } catch (e) {
      alert(e.response?.data?.error || e.message || 'Ошибка переименования проекта');
    }
  };

  return (
    <li className="group relative border dark:backdrop-blur-md bg-white/5 border-white/10 rounded-2xl shadow-xl hover:shadow-xl transition-all duration-200 p-6 flex flex-col justify-between overflow-hidden">
      {/* SVG круг и логомарка */}
      <div className="absolute right-6 top-6 opacity-10 group-hover:opacity-20 transition">
        <svg width="48" height="48" viewBox="0 0 180 180" fill="none">
          <circle cx="90" cy="90" r="90" fill="black" />
          <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="white" fillOpacity="0.7"/>
        </svg>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition">
            {project.name}
          </span>
        </div>
        <div className="text-gray-500 text-sm mb-4 min-h-[32px]">
          {project.description || <span className="italic text-gray-400">Нет описания</span>}
        </div>
      </div>
      <div className="flex gap-2 mt-2 items-center">
        <Link
          href={`/projects/${project.id}/editor`}
          className="inline-flex items-center gap-1 text-sm font-medium text-black dark:text-white hover:underline"
        >
          <svg width="16" height="16" fill="none" className="mr-1" viewBox="0 0 16 16">
            <path d="M4 8h8M8 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Открыть редактор
        </Link>
        <button
          onClick={handleRename}
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition"
          title="Переименовать проект"
        >
          <HiOutlinePencil />
          <span className="sr-only">Переименовать</span>
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:underline px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          title="Удалить проект"
        >
          <FaTrash className="text-red-500" />
          <span className="sr-only">Удалить</span>
        </button>
      </div>
    </li>
  );
}