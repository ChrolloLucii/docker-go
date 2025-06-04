'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import ProjectCard from "@/components/ProjectCard";
import NewProjectForm from "@/components/newProjectForm";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    axios.get("/api/projects", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProjects(res.data))
      .catch(err => {
        setError(err.response?.data?.error || "Ошибка загрузки проектов");
        if (err.response?.status === 401) {
          window.location.href = "/login";
        }
      });
  }, []);
  const handleProjectCreated = (project) => {
    setProjects(prev => [project, ...prev]);
  };

  const handleProjectDelete = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen dark:bg-black bg-white">
      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Мои проекты
          </h1>
        </div>
        <NewProjectForm onCreated={handleProjectCreated} />
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map(project => (
           <ProjectCard
            key={project.id}
            project={project}
            onDelete={handleProjectDelete}
            onRename={updatedProject => setProjects(prev =>
              prev.map(p => p.id === updatedProject.id ? updatedProject : p)
            )}
          />
          ))}
        </ul>
        {projects.length === 0 && !error && (
          <div className="text-center text-gray-500 mt-16">
            <div className="text-5xl mb-4">🗂️</div>
            <div className="text-lg">У вас пока нет проектов.</div>
          </div>
        )}
      </div>
    </div>
  );
}