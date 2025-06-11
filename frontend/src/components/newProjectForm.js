import { useState } from "react";
import axios from "axios";
import { getToken } from "@/utils/tokenCookie";
import styles from "@/styles/newProjectForm.module.css";

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
      const token = getToken();
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
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>
        <span className={styles.formIcon}>➕</span>
        Создать новый проект
      </h2>
      
      <form onSubmit={handleCreate} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            className={styles.input}
            placeholder="Название проекта"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            className={styles.input}
            placeholder="Описание (необязательно)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner}></span>
              Создание...
            </>
          ) : (
            <>
              <span className={styles.buttonIcon}></span>
              Создать
            </>
          )}
        </button>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
      </form>
    </div>
  );
}