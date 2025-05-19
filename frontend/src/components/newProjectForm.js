import { useState } from "react";
import axios from "axios";

export default function NewProjectForm({ onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/projects",
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setDescription("");
      setLoading(false);
      onCreated(res.data); // обновить список проектов
    } catch (e) {
      setError(e.response?.data?.error || "Ошибка создания проекта");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="mb-6">
      <input
        className="border rounded px-3 py-2 mr-2 dark:text-gray-100 text-gray-700 "
        placeholder="Название проекта"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        className="border rounded px-3 py-2 mr-2 dark:text-gray-100 text-gray-700"
        placeholder="Описание (необязательно)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <button
        type="submit"
        className="bg-black dark:bg-white dark:text-black text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Создание..." : "Создать"}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </form>
  );
}