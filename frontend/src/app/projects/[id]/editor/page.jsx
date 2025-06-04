'use client';

import { useState, useEffect, useRef } from "react";
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
  
  const safeStages = Array.isArray(stages) && stages.length
    ? stages
    : [{ id: "stage-1", name: "Stage 1", instructions: [] }];

  const [activeStage, setActiveStage] = useState(safeStages[0].id);
  const socketRef = useRef();

  // Получаем projectId из params асинхронно
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
    if (selectedFile?.id) {
      socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000");
      socketRef.current.emit('joinfile', selectedFile.id);
      
      return () => {
        socketRef.current.emit('leavefile', selectedFile.id);
        socketRef.current.disconnect();
      };
    }
  }, [selectedFile?.id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
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
    setIsClient(true);
  }, []);

  // Загружаем файлы только когда projectId готов
  useEffect(() => {
    if (!projectId) return;

    const token = localStorage.getItem("token");
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
    const token = localStorage.getItem("token");
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
    const token = localStorage.getItem("token");
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
    const token = localStorage.getItem("token");
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
    if (selectedFile?.id && socketRef.current) {
      socketRef.current.emit('fileEdit', { fileId: selectedFile.id, content: text, userId: currentUserId });
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!projectId) return;
    
    setInviteError(""); 
    setInviteSuccess("");
    const token = localStorage.getItem("token");
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
  if (selectedFile?.id && socketRef.current) {
    socketRef.current.emit('fileEdit', { fileId: selectedFile.id, content: newContent, userId: currentUserId });
  }
};

  const handleSave = async () => {
    if (!selectedFile || !projectId) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
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
    if (!socketRef.current) return;
    socketRef.current.on('fileEdited', ({ fileId, content, userId }) => {
      if (fileId === selectedFile?.id && userId !== currentUserId) {
        setContent(content);
        setStages(dockerfileToStages(content));
      }
    });
    return () => {
      socketRef.current.off('fileEdited');
    };
  }, [selectedFile?.id, currentUserId]);

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
          
          <button className="btn btn-secondary" disabled={!selectedFile}>
            <FiPlay />
            Запустить
          </button>
          
          <button 
            className="btn btn-ghost"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FiSettings />
          </button>
        </div>
      </header>

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
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #00ff88;
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
      `}</style>
    </div>
  );
}