import Link from "next/link";
import axios from "axios";
import { getToken } from "@/utils/tokenCookie";
import styles from "@/styles/projectCard.module.css";

export default function ProjectCard({ project, onDelete, onRename }) {
  const handleDelete = async () => {
    if (confirm('Удалить проект? Это действие необратимо.')) {
      try {
        const token = getToken();
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
      const token = getToken();
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
    <div className={styles.projectCard}>
      <div className={styles.cardHeader}>
        <div className={styles.statusIndicator}></div>
        <div className={styles.cardActions}>
          <button
            onClick={handleRename}
            className={styles.actionButton}
            title="Переименовать проект"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className={`${styles.actionButton} ${styles.deleteButton}`}
            title="Удалить проект"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <div className={styles.cardContent}>
        <h3 className={styles.projectTitle}>{project.name}</h3>
        <p className={styles.projectDescription}>
          {project.description || <span className={styles.noDescription}>Нет описания</span>}
        </p>
      </div>
      
      <div className={styles.cardFooter}>
        <Link
          href={`/projects/${project.id}/editor`}
          className={styles.openButton}
        >
          <span className={styles.buttonIcon}></span>
          Открыть редактор
        </Link>
      </div>
      
      <div className={styles.cardGlow}></div>
    </div>
  );
}