'use client';
import { useState, useEffect, useRef } from "react";
import {io} from "socket.io-client";
import axios from "axios";
import { use } from "react"
import dynamic from "next/dynamic";
import { v4 as uuidv4 } from "uuid";
import { lintDockerfile } from "@/services/lintApi";
import debounce from "lodash.debounce";
import { useCallback } from "react";
import Sidebar from '@/components/editor/Sidebar';
import EditorToolbar from '@/components/editor/EditorToolbar';
import DockerfileTextEditor from '@/components/editor/DockerfileTextEditor';
function dockerfileToStages(text) {
  if (!text) return [{ id: "stage-1", name: "Stage 1", instructions: [] }];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const stages = [];
  const safeStages = Array.isArray(stages) && stages.length
  ? stages
  : [{ id: "stage-1", name: "Stage 1", instructions: [] }];
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
});
export default function EditorPage({ params }) {
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [lintOutput, setLintOutput] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [stages, setStages] = useState([
  { id: "stage-1", name: "Stage 1", instructions: [] }
]);
 const safeStages = Array.isArray(stages) && stages.length
  ? stages
  : [{ id: "stage-1", name: "Stage 1", instructions: [] }];

const [activeStage, setActiveStage] = useState(safeStages[0].id);
const socketRef = useRef();
useEffect(() => {
  socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000");
  socketRef.current.emit('joinfile', selectedFile?.id);
  return () => {
    socketRef.current.emit('leavefile', selectedFile?.id);
    socketRef.current.disconnect();
  };
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
const handleFileCreate = async () => {
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
    alert("Ошибка создания файла");
  }
};

const handleFileRename = async (file) => {
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
  socketRef.current?.emit('fileEdit', { fileId: selectedFile.id, content: text, userId: currentUserId });
};
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const routeParams = typeof params.then === "function" ? use(params) : params;
  const projectId = routeParams.id;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    axios.get(`/api/projects/${projectId}/files`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setFiles(res.data))
      .catch(err => setError(err.response?.data?.error || "Ошибка загрузки файлов"));
  }, [projectId]);
  const handleInvite = async (e) => {
  e.preventDefault();
  setInviteError(""); setInviteSuccess("");
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
    if (!newStages.length) {
      setStages([{ id: "stage-1", name: "Stage 1", instructions: [] }]);
      setContent("");
      socketRef.current?.emit('fileEdit', { fileId: selectedFile.id, content: "", userId: currentUserId });
      return;
    }
    setStages(newStages);
    const newContent = stagesToDockerfile(newStages);
    setContent(newContent);
    socketRef.current?.emit('fileEdit', { fileId: selectedFile.id, content: newContent, userId: currentUserId });
  };

 const handleSave = async () => {
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
    alert("Файл сохранён!");
  } catch (err) {
    alert("Ошибка сохранения файла");
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [content]);
useEffect(() => {
  if (!socketRef.current) return;
  socketRef.current.on('fileEdited', ({ fileId, content, userId }) => {
    if (fileId === selectedFile.id && userId !== currentUserId) {
      setContent(content);
      setStages(dockerfileToStages(content));
    }
  });
  return () => {
    socketRef.current.off('fileEdited');
  };
}, [selectedFile?.id, currentUserId]);
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-black dark:to-white/10">
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
      <main className="flex-1 p-6">
        {selectedFile ? (
          <>
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {selectedFile.name}
            </h1>
            <div className="flex flex-row gap-12 items-start">
              <div className="flex-1 min-w-[350px] max-w-[700px]">
                <DockerfileTextEditor
                  content={content}
                  onChange={handleContentChange}
                  lintOutput={lintOutput}
                />
                {lintOutput && (
                  <pre className="mt-2 p-2 bg-red-50 border border-red-300 rounded text-red-800 text-sm whitespace-pre-wrap">
                    {lintOutput}
                  </pre>
                )}
                <EditorToolbar
                  onSave={handleSave}
                  onExport={handleExport}
                  onImport={handleImport}
                />
              </div>
              <div className="flex-1 min-w-[350px] max-w-[600px]">
                <DockerFileEditorVisual
                  stages={stages}
                  onChange={handleStagesChange}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-gray-500 text-center mt-20">
            Выберите файл для редактирования
          </div>
        )}
      </main>
    </div>
  );
}