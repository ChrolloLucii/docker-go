'use client';
import { useEffect, useState } from "react";
import axios from "axios";

function TabButton({ active, onClick, children }) {
  return (
    <button
      className={`px-4 py-2 rounded-t ${active ? "bg-black text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"} font-semibold`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Загрузка данных
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    setError("");
    Promise.all([
      axios.get("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("/api/admin/projects", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("/api/templates", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
    ])
      .then(([usersRes, projectsRes, templatesRes]) => {
        setUsers(usersRes.data);
        setProjects(projectsRes.data);
        setTemplates(templatesRes.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Ошибка загрузки данных");
        setLoading(false);
      });
  }, []);

  // Управление ролями
  const handleRoleChange = async (userId, newRole) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users => users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch {
      alert("Ошибка смены роли");
    }
  };

  // Удаление пользователя
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Удалить пользователя?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users => users.filter(u => u.id !== userId));
    } catch {
      alert("Ошибка удаления пользователя");
    }
  };

  // Удаление проекта
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Удалить проект?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/admin/projects/${projectId}`, { headers: { Authorization: `Bearer ${token}` } });
      setProjects(projects => projects.filter(p => p.id !== projectId));
    } catch {
      alert("Ошибка удаления проекта");
    }
  };

  // Удаление шаблона
  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm("Удалить шаблон?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/templates/${templateId}`, { headers: { Authorization: `Bearer ${token}` } });
      setTemplates(templates => templates.filter(t => t.id !== templateId));
    } catch {
      alert("Ошибка удаления шаблона");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Админ-панель</h1>
      <div className="flex gap-2 mb-6">
        <TabButton active={tab === "users"} onClick={() => setTab("users")}>Пользователи</TabButton>
        <TabButton active={tab === "projects"} onClick={() => setTab("projects")}>Проекты</TabButton>
        <TabButton active={tab === "templates"} onClick={() => setTab("templates")}>Шаблоны</TabButton>
      </div>
      {loading && <div className="text-gray-500">Загрузка...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {tab === "users" && (
        <table className="w-full border mb-8">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2">Email</th>
              <th className="p-2">Роль</th>
              <th className="p-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="p-2">
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => handleDeleteUser(u.id)}
                  >Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "projects" && (
        <table className="w-full border mb-8">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2">Название</th>
              <th className="p-2">Владелец</th>
              <th className="p-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.ownerId}</td>
                <td className="p-2">
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => handleDeleteProject(p.id)}
                  >Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "templates" && (
        <table className="w-full border mb-8">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2">Название</th>
              <th className="p-2">Автор</th>
              <th className="p-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(t => (
              <tr key={t.id} className="border-t">
                <td className="p-2">{t.name}</td>
                <td className="p-2">{t.authorId}</td>
                <td className="p-2">
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => handleDeleteTemplate(t.id)}
                  >Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}