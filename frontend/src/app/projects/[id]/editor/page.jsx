'use client';

import { useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import dynamic from "next/dynamic";
import { v4 as uuidv4 } from "uuid";
import { lintDockerfile } from "@/services/lintApi";
import debounce from "lodash.debounce";
import { useCallback } from "react";
import Sidebar from '@/components/editor/Sidebar';
import EditorToolbar from '@/components/editor/EditorToolbar';
import DockerfileTextEditor from '@/components/editor/DockerfileTextEditor';
import { FiCode, FiEye, FiSave, FiPlay, FiSettings } from 'react-icons/fi';
import { getToken } from "@/utils/tokenCookie";
import { SocketContext } from "@/context/SocketContext";
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
function dockerfileToStages(text) {
  if (!text) return [{ id: "stage-1", name: "Stage 1", instructions: [] }];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const stages = [];
  let current = null;
  
  lines.forEach(line => {
    const [type, ...rest] = line.split(' ');
    if (type === "FROM") {
      if (current) stages.push(current);
      current = {
        id: `stage-${stages.length + 1}`,
        name: `Stage ${stages.length + 1}`,
        instructions: []
      };
    }
    if (current) {
      current.instructions.push({
        id: uuidv4(),
        type,
        value: rest.join(' ')
      });
    }
  });
  
  if (current) stages.push(current);
  return stages.length ? stages : [{ id: "stage-1", name: "Stage 1", instructions: [] }];
}

function stagesToDockerfile(stages) {
  return stages
    .map(stage =>
      stage.instructions.map(ins => `${ins.type} ${ins.value}`.trim()).join('\n')
    )
    .join('\n');
}

const DockerFileEditorVisual = dynamic(() => import("@/components/DockerFileEditorVisual"), {
  ssr: false
});

export default function EditorPage({ params }) {
  const [projectId, setProjectId] = useState(null);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [lintOutput, setLintOutput] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('visual');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
const [stages, setStages] = useState([{ id: "stage-1", name: "Stage 1", instructions: [] }]);
const [content, setContent] = useState("");
  
const socket = useContext(SocketContext);

  const safeStages = Array.isArray(stages) && stages.length
    ? stages
    : [{ id: "stage-1", name: "Stage 1", instructions: [] }];

  const [activeStage, setActiveStage] = useState(safeStages[0].id);



  const [dockerBuild, setDockerBuild] = useState({
    building: false,
    result: null,
    error: null
  });
const saveContainerState = (containerData) => {
    const key = `docker-container-${projectId}`;
    if (containerData) {
      localStorage.setItem(key, JSON.stringify(containerData));
    } else {
      localStorage.removeItem(key);
    }
  };

  const loadContainerState = () => {
    if (!projectId) return null;
    const key = `docker-container-${projectId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        localStorage.removeItem(key);
        return null;
      }
    }
    return null;
  };

const checkContainerStatus = async (containerName) => {
  try {
    const token = getToken();
    const response = await axios.get(
      `/api/docker/containers/${containerName}/status`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data.isRunning;
  } catch (error) {
    console.error('Error checking container status:', error);
    return false;
  }
};
 const handleDockerBuild = async () => {
    if (!selectedFile || !content) {
      alert("Выберите файл и убедитесь, что он содержит Dockerfile");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("Вы не авторизованы. Пожалуйста, войдите в систему.");
      window.location.href = "/login";
      return;
    }

    setDockerBuild({ building: true, result: null, error: null });
    
    try {
      const response = await axios.post(
        '/api/docker/build-and-run',
        {
          dockerfileContent: content,
          projectId: projectId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const result = response.data;
      
      setDockerBuild({
        building: false,
        result,
        error: null
      });
      saveContainerState(result);

    } catch (error) {
      setDockerBuild({
        building: false,
        result: null,
        error: error.response?.data?.error || "Ошибка сборки Docker образа"
      });
    }
  };

 const handleStopContainer = async () => {
    if (!dockerBuild.result?.containerName) return;

    try {
      const token = getToken();
      await axios.delete(
        `/api/docker/containers/${dockerBuild.result.containerName}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setDockerBuild(prev => ({
        ...prev,
        result: null
      }));

      saveContainerState(null);

    } catch (error) {
      alert("Ошибка остановки контейнера");
    }
  };
  const handleForceCleanup = async () => {
  if (!window.confirm("Остановить все контейнеры пользователя? Это действие нельзя отменить.")) {
    return;
  }

  try {
    const token = getToken();
    if (!token) {
      alert("Токен не найден. Войдите в систему снова.");
      window.location.href = "/login";
      return;
    }

    const response = await axios.delete(
      '/api/docker/containers/cleanup',
      {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('Cleanup response:', response.data);

    setDockerBuild(prev => ({
      ...prev,
      result: null
    }));

    saveContainerState(null);
    alert(`Успешно: ${response.data.message}`);

  } catch (error) {
    console.error('Cleanup error:', error);
    
    if (error.response?.status === 403) {
      alert("Нет прав доступа. Проверьте авторизацию.");
    } else if (error.response?.status === 401) {
      alert("Необходима авторизация. Войдите в систему снова.");
      removeToken();
      window.location.href = "/login";
    } else {
      alert(`Ошибка очистки контейнеров: ${error.response?.data?.error || error.message}`);
    }
  }
};
 useEffect(() => {
  const savedContainer = loadContainerState(); // ← ДОБАВЬТЕ ЭТУ СТРОКУ
  
  if (savedContainer) {
    checkContainerStatus(savedContainer.containerName).then(isRunning => {
      if (isRunning) {
        setDockerBuild(prev => ({
          ...prev,
          result: savedContainer
        }));
      } else {
        // Контейнер не запущен, удаляем из localStorage
        saveContainerState(null);
      }
    }).catch(error => {
      // Игнорируем ошибки проверки статуса
      console.warn('Container status check failed:', error);
      saveContainerState(null);
    });
  }
}, [projectId]);
  useEffect(() => {
    const getProjectId = async () => {
      try {
        const resolvedParams = await params;
        setProjectId(resolvedParams.id);
      } catch (error) {
        console.error('Error resolving params:', error);
        setError('Ошибка получения ID проекта');
      }
    };

    getProjectId();
  }, [params]);

  useEffect(() => {
    if (selectedFile?.id && socket) {
      socket.emit('joinfile', selectedFile.id);
      return () => {
        socket.emit('leavefile', selectedFile.id);
      };
    }
  }, [selectedFile?.id, socket]);

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id);
      } catch (e) {
        setCurrentUserId(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!safeStages.find(s => s.id === activeStage)) {
      setActiveStage(safeStages[0].id);
    }
  }, [safeStages, activeStage]);

  const currentStage = safeStages.find(s => s.id === activeStage) || safeStages[0];

  useEffect(() => {
    if (selectedFile) {
      const parsedStages = dockerfileToStages(selectedFile.content);
      setStages(parsedStages);
      setContent(selectedFile.content);
    }
  }, [selectedFile]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setIsClient(true);
  }, []);

  // Загружаем файлы только когда projectId готов
  useEffect(() => {
    if (!projectId) return;

    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    setIsLoading(true);
    axios.get(`/api/projects/${projectId}/files`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setFiles(res.data);
        setError("");
      })
      .catch(err => {
        setError(err.response?.data?.error || "Ошибка загрузки файлов");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [projectId]);

  const handleFileCreate = async () => {
    if (!projectId) return;
    
    const name = prompt("Имя нового файла (например, Dockerfile):");
    if (!name) return;
    const token = getToken();
    try {
      const res = await axios.post(
        `/api/projects/${projectId}/files`,
        { name, content: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("File creation error:", err);
      if (err.response?.status === 404) {
        alert("Проект не найден. Возможно, он был удален.");
        window.location.href = "/projects";
      } else {
        alert(err.response?.data?.error || "Ошибка создания файла");
      }
    }
  };

  const handleFileRename = async (file) => {
    if (!projectId) return;
    
    const newName = prompt("Новое имя файла:", file.name);
    if (!newName || newName === file.name) return;
    const token = getToken();
    try {
      await axios.put(
        `/api/projects/${projectId}/files/${file.id}`,
        { ...file, name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles((prev) => prev.map(f => f.id === file.id ? { ...f, name: newName } : f));
      if (selectedFile?.id === file.id) setSelectedFile({ ...file, name: newName });
    } catch {
      alert("Ошибка переименования файла");
    }
  };

  const handleFileDelete = async (file) => {
    if (!projectId) return;
    
    if (!window.confirm("Удалить файл?")) return;
    const token = getToken();
    try {
      await axios.delete(
        `/api/projects/${projectId}/files/${file.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles((prev) => prev.filter(f => f.id !== file.id));
      if (selectedFile?.id === file.id) {
        setSelectedFile(null);
        setStages([{ id: "stage-1", name: "Stage 1", instructions: [] }]);
        setContent("");
      }
    } catch {
      alert("Ошибка удаления файла");
    }
  };

  const handleExport = () => {
    if (!selectedFile) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    let fileName = selectedFile.name;
    if (!/\.(dockerfile|Dockerfile)$/i.test(fileName)) {
      fileName += ".dockerfile";
    }
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!/\.dockerfile$/i.test(file.name) && file.name !== "Dockerfile") {
      alert("Можно импортировать только файлы с расширением .dockerfile или файл с именем Dockerfile");
      return;
    }
    const text = await file.text();
    setContent(text);
    setStages(dockerfileToStages(text));
  };

  const handleContentChange = (e) => {
    const text = e.target.value;
    setContent(text);
    setStages(dockerfileToStages(text));
    if (selectedFile?.id && socket) {
      socket.emit('fileEdit', { fileId: selectedFile.id, content: text, userId: currentUserId });
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!projectId) return;
    
    setInviteError(""); 
    setInviteSuccess("");
    const token = getToken();
    try {
      await axios.post(
        `/api/projects/${projectId}/members/by-username`,
        { username: inviteUsername, role: "editor" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInviteSuccess("Пользователь добавлен!");
      setInviteUsername("");
    } catch (err) {
      setInviteError(err.response?.data?.error || "Ошибка приглашения");
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setContent(file.content);
  };

const handleStagesChange = (newStages) => {
  setStages(newStages);
  const newContent = stagesToDockerfile(newStages);
  setContent(newContent);
  if (selectedFile?.id && socket) {
    socket.emit('fileEdit', { fileId: selectedFile.id, content: newContent, userId: currentUserId });
  }
};

  const handleSave = async () => {
    if (!selectedFile || !projectId) return;
    setIsSaving(true);
    try {
      const token = getToken();
      await axios.put(
        `/api/projects/${projectId}/files/${selectedFile.id}`,
        {
          ...selectedFile,
          content,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // Показать уведомление об успешном сохранении
    } catch (err) {
      alert("Ошибка сохранения файла");
    } finally {
      setIsSaving(false);
    }
  };

  const runLint = useCallback(
    debounce(async (dockerfileText) => {
      try {
        const result = await lintDockerfile(dockerfileText);
        setLintOutput(result);
      } catch (e) {
        setLintOutput("Ошибка проверки hadolint");
      }
    }, 500),
    []
  );

  useEffect(() => {
  if (content) runLint(content);
  else setLintOutput("");
}, [content, runLint]);

  useEffect(() => {
    if (!socket) return;
    socket.on('fileEdited', ({ fileId, content, userId }) => {
      if (fileId === selectedFile?.id && userId !== currentUserId) {
        setContent(content);
        setStages(dockerfileToStages(content));
      }
    });
    return () => {
      socket.off('fileEdited');
    };
  }, [selectedFile?.id, currentUserId, socket]);

  if (!isClient || isLoading || !projectId) {
    return (
      <div className="editor-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="editor-loading">
        <div style={{color: '#ff6b6b', textAlign: 'center'}}>
          <h3>Ошибка</h3>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      {/* Header */}
      <header className="editor-header">
        <div className="editor-header-left">
          <h1 className="project-title">
            {selectedFile ? selectedFile.name : 'Docker Editor'}
          </h1>
          <span className="project-status">
            <div className="status-dot"></div>
            {selectedFile ? 'Активен' : 'Выберите файл'}
          </span>
        </div>
        
        <div className="editor-header-right">
          <button 
            onClick={handleSave}
            disabled={isSaving || !selectedFile}
            className="btn btn-primary"
          >
            <FiSave />
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
          
            <button 
          onClick={handleDockerBuild}
          disabled={dockerBuild.building || !selectedFile}
          className="btn btn-secondary"
        >
          {dockerBuild.building ? 'Сборка...' : '🐳 Собрать и запустить'}
        </button>

        {dockerBuild.result && (
          <>
            <button 
              onClick={handleStopContainer}
              className="btn btn-danger"
            >
              ⏹️ Остановить
            </button>
          </>
        )}
          
          <button 
            className="btn btn-ghost"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FiSettings />
          </button>
        </div>
        
      </header>
          {(dockerBuild.result || dockerBuild.error) && (
        <div className="docker-results">
          {dockerBuild.result && (
            <div className="docker-success">
              <h4>✅ Docker контейнер запущен!</h4>
              <p>
                <strong>URL:</strong>{' '}
                <a 
                  href={dockerBuild.result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="docker-link"
                >
                  {dockerBuild.result.url}
                </a>
              </p>
              <p><strong>Контейнер:</strong> {dockerBuild.result.containerName}</p>
              <details>
                <summary>Вывод сборки</summary>
                <pre className="docker-output">{dockerBuild.result.buildOutput}</pre>
              </details>
            </div>
          )}
          
          {dockerBuild.error && (
            <div className="docker-error">
              <h4>❌ Ошибка сборки</h4>
              <p>{dockerBuild.error}</p>
            </div>
          )}
        </div>
      )}
      {/* Main Content */}
      <div className="editor-content">
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          inviteUsername={inviteUsername}
          setInviteUsername={setInviteUsername}
          inviteError={inviteError}
          inviteSuccess={inviteSuccess}
          handleInvite={handleInvite}
          files={files}
          selectedFile={selectedFile}
          handleFileSelect={handleFileSelect}
          handleFileCreate={handleFileCreate}
          handleFileRename={handleFileRename}
          handleFileDelete={handleFileDelete}
        />

        {/* Editor Area */}
        <main className="editor-main">
          {selectedFile ? (
            <>
              {/* Tabs */}
              <div className="editor-tabs">
                <button 
                  className={`tab ${activeTab === 'visual' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('visual')}
                >
                  <FiEye />
                  Визуальный редактор
                </button>
                <button 
                  className={`tab ${activeTab === 'code' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('code')}
                >
                  <FiCode />
                  Код
                </button>
              </div>

              {/* Editor Content */}
              <div className="editor-workspace">
                  {activeTab === 'visual' ? (
                  <DockerFileEditorVisual
                    stages={stages}
                    onChange={handleStagesChange}
                  />
                ) : (
                  <div className="code-editor">
                    <textarea 
                      value={content}
                      onChange={handleContentChange}
                      placeholder="# Ваш Dockerfile"
                    />
                    {lintOutput && (
                      <div className="lint-output">
                        <h4>Результат проверки Hadolint:</h4>
                        <pre>{lintOutput}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Toolbar */}
              <div className="editor-toolbar">
                <EditorToolbar
                  onSave={handleSave}
                  onExport={handleExport}
                  onImport={handleImport}
                />
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>Выберите файл для редактирования</h3>
              <p>Создайте новый файл или выберите существующий из списка слева</p>
              <button 
                className="btn btn-primary"
                onClick={handleFileCreate}
              >
                Создать новый файл
              </button>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .editor-container {
          min-height: 100vh;
          background: #000000;
          color: #ffffff;
          display: flex;
          flex-direction: column;
        }

        .editor-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #000000;
          color: #ffffff;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top: 3px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
        }

        .editor-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .project-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .project-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
        }        .status-dot {
          width: 8px;
          height: 8px;
          background: #6ec1e4;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .editor-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #ffffff;
          color: #000000;
        }

        .btn-primary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
        }

        .btn-ghost {
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          padding: 8px;
        }

        .btn-ghost:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .editor-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .editor-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .editor-tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
        }

        .tab:hover {
          color: rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.05);
        }

        .tab-active {
          color: #ffffff;
          border-bottom-color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }

        .editor-workspace {
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        .code-editor {
          height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .code-editor textarea {
          flex: 1;
          background: #000000;
          color: #ffffff;
          border: none;
          padding: 20px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          line-height: 1.5;
          resize: none;
          outline: none;
        }

        .code-editor textarea::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .lint-output {
          background: rgba(255, 0, 0, 0.1);
          border-top: 1px solid rgba(255, 0, 0, 0.3);
          padding: 16px;
          max-height: 200px;
          overflow-y: auto;
        }

        .lint-output h4 {
          margin: 0 0 8px 0;
          color: #ff6b6b;
          font-size: 14px;
        }

        .lint-output pre {
          margin: 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          white-space: pre-wrap;
        }

        .editor-toolbar {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
          padding: 12px 16px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          padding: 40px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          color: rgba(255, 255, 255, 0.8);
          font-size: 20px;
        }

        .empty-state p {
          margin: 0 0 24px 0;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .editor-header {
            padding: 12px 16px;
          }
          
          .editor-header-right {
            flex-wrap: wrap;
            gap: 4px;
          }
          
          .btn {
            padding: 6px 12px;
            font-size: 13px;
          }
        }
         .docker-results {
    position: fixed;
    bottom: 20px;
    right: 20px;
    max-width: 400px;
    background: rgba(0, 0, 0, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 20px;
    z-index: 1000;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    animation: slideInUp 0.3s ease-out;
  }

  @keyframes slideInUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .docker-success {
    color: #4caf50;
  }

  .docker-success h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .docker-success p {
    margin: 8px 0;
    font-size: 14px;
    line-height: 1.4;
  }

  .docker-error {
    color: #f44336;
  }

  .docker-error h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .docker-link {
    color: #64b5f6;
    text-decoration: none;
    font-weight: 500;
    word-break: break-all;
  }

  .docker-link:hover {
    text-decoration: underline;
    color: #90caf9;
  }

  .docker-output {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 12px;
    font-size: 12px;
    max-height: 200px;
    overflow-y: auto;
    white-space: pre-wrap;
    margin-top: 8px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }

  details {
    margin-top: 12px;
  }

  details summary {
    cursor: pointer;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    padding: 4px 0;
  }

  details summary:hover {
    color: rgba(255, 255, 255, 1);
  }

  // ...остальные стили без изменений...

  @media (max-width: 768px) {
    .editor-header {
      padding: 12px 16px;
    }
    
    .editor-header-right {
      flex-wrap: wrap;
      gap: 4px;
    }
    
    .btn {
      padding: 6px 12px;
      font-size: 13px;
    }

    .docker-results {
      bottom: 10px;
      right: 10px;
      left: 10px;
      max-width: none;
    }
  }
      `}</style>
    </div>
  );
}