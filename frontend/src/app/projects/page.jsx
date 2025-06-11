'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import ProjectCard from "@/components/ProjectCard";
import NewProjectForm from "@/components/newProjectForm";
import { getToken } from "@/utils/tokenCookie";
import styles from "@/styles/projects.module.css";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
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
    <div className={styles.projectsContainer}>
      <div className={styles.backgroundEffects}>
        <div className={styles.gridPattern}></div>
        <div className={styles.glowOrb}></div>
      </div>
      
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>🗂️</span>
            Мои проекты
          </h1>
        </div>
        
        <div className={styles.mainContent}>
          <NewProjectForm onCreated={handleProjectCreated} />
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <div className={styles.projectsGrid}>
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
          </div>
          
          {projects.length === 0 && !error && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🗂️</div>
              <div className={styles.emptyText}>У вас пока нет проектов.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}