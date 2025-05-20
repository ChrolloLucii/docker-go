'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { use } from "react"
import dynamic from "next/dynamic";
import { v4 as uuidv4 } from "uuid";
import { lintDockerfile } from "@/services/lintApi";
import debounce from "lodash.debounce";
import { useCallback } from "react";
  function blocksToDockerfile(blocks){
    return blocks.map(b => `${b.type} ${b.value}`.trim()).join('\n');
  }
function dockerfileToBlocks(text) {
  if (!text) return [];
  return text
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [type, ...rest] = line.trim().split(' ');
      return { id: uuidv4(), type, value: rest.join(' ') };
    });
}
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
  const [stages, setStages] = useState([
  { id: "stage-1", name: "Stage 1", instructions: [] }
]);
 const safeStages = Array.isArray(stages) && stages.length
  ? stages
  : [{ id: "stage-1", name: "Stage 1", instructions: [] }];

const [activeStage, setActiveStage] = useState(safeStages[0].id);
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

const handleBlocksChange = (newBlocks) => {
  const newContent = blocksToDockerfile(newBlocks);
  setBlocks(newBlocks);
  setContent(newContent);
};

const handleContentChange = (e) => {
  const text = e.target.value;
  setContent(text);
  setStages(dockerfileToStages(text));
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
    return;
  }
  setStages(newStages);
  setContent(stagesToDockerfile(newStages));
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
}, [content, runLint]);
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-black dark:to-gray-900">
      {/* Сайдбар */}
      <aside
        className={`transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-12"
        } border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col relative`}
        style={{ minWidth: sidebarOpen ? "16rem" : "3rem" }}
      >
        <button
          className="absolute -right-4 top-6 z-10 bg-black dark:bg-white text-white dark:text-black rounded-full w-8 h-8 flex items-center justify-center shadow hover:scale-110 transition"
          onClick={() => setSidebarOpen((v) => !v)}
          title={sidebarOpen ? "Свернуть" : "Развернуть"}
        >
          {sidebarOpen ? (
            <span>&#8592;</span>
          ) : (
            <span>&#8594;</span>
          )}
        </button>
        {sidebarOpen && (
          <>
            <form onSubmit={handleInvite} className="mb-4 items-center">
            <input
              type="text"
              placeholder="Ник пользователя"
              value={inviteUsername}
              onChange={e => setInviteUsername(e.target.value)}
              className="border rounded px-2 py-1 flex-1"
              required
            />
            <button
              type="submit"
              className="dark:bg-white dark:text-black bg-black text-white px-3 py-1 my-4 rounded"
            >
              Пригласить
            </button>
          </form>
{inviteError && <div className="text-red-500 mb-2">{inviteError}</div>}
{inviteSuccess && <div className="text-green-600 mb-2">{inviteSuccess}</div>}
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Файлы проекта</h2>
            <form
  onSubmit={async (e) => {
    e.preventDefault();
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
  }}
>
  <button
    type="submit"
    className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full"
  >
    + Новый файл
  </button>
</form>
    <ul className="space-y-2">
  {files.map(file => (
    <li key={file.id} className="flex items-center">
      <button
        className={`flex-1 text-left px-3 py-2 rounded-lg ${
          selectedFile?.id === file.id
            ? "bg-black text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
        }`}
        onClick={() => handleFileSelect(file)}
      >
        {file.name}
      </button>
      {/* Кнопка переименования */}
      <button
        className="ml-2 text-blue-500 hover:text-blue-700"
        title="Переименовать файл"
        onClick={async (e) => {
          e.stopPropagation();
          const newName = prompt("Новое имя файла:", file.name);
          if (!newName || newName === file.name) return;
          const token = localStorage.getItem("token");
          try {
            await axios.put(
              `/api/projects/${projectId}/files/${file.id}`,
              { ...file, name: newName },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setFiles((prev) =>
              prev.map(f => f.id === file.id ? { ...f, name: newName } : f)
            );
            if (selectedFile?.id === file.id) setSelectedFile({ ...file, name: newName });
          } catch {
            alert("Ошибка переименования файла");
          }
        }}
      >
        ✎
      </button>
      {/* Кнопка удаления */}
      <button
        className="ml-2 text-red-500 hover:text-red-700"
        title="Удалить файл"
        onClick={async (e) => {
          e.stopPropagation();
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
        }}
      >
        ✕
      </button>
    </li>
  ))}
</ul>
          </>
        )}
      </aside>

      {/* Главная область */}
      <main className="flex-1 p-6">
  {selectedFile && (
    <>
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        {selectedFile.name}
      </h1>
      <div className="flex flex-row gap-12 items-start"> {/* Добавлен flex-контейнер и gap */}
        {/* Визуальный редактор */}
        
        {/* Текстовый редактор */}
        <div className="flex-1 min-w-[350px] max-w-[700px]">
          <div className="flex bg-white dark:bg-gray-950 rounded-lg border p-2 relative">
            {/* Нумерация строк */}
            <div
              className="text-right select-none pr-2 text-gray-400"
              style={{ minWidth: 32, userSelect: "none" }}
              aria-hidden
            >
              {content.split('\n').map((_, i) => (
                <div key={i} style={{ height: 24, lineHeight: "24px" }}>{i + 1}</div>
              ))}
            </div>
            {/* Текстовый редактор */}
            <textarea
              className="flex-1 bg-transparent outline-none resize-none"
              style={{ minHeight: 200, fontFamily: "monospace", lineHeight: "24px" }}
              value={content}
              onChange={handleContentChange}
              spellCheck={false}
              rows={content.split('\n').length || 1}
            />
          </div>
          {lintOutput && (
            <pre className="mt-2 p-2 bg-red-50 border border-red-300 rounded text-red-800 text-sm whitespace-pre-wrap">
              {lintOutput}
            </pre>
          )}
          <button
            onClick={handleSave}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Сохранить
          </button>
          <button
  className="ml-2 px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
  onClick={() => {
    if (!selectedFile) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    // Имя файла: если есть расширение — оставить, иначе добавить .dockerfile
    let fileName = selectedFile.name;
    if (!/\.(dockerfile|Dockerfile)$/i.test(fileName)) {
      fileName += ".dockerfile";
    }
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }}
>
  Экспорт Dockerfile
</button>
   <label
  htmlFor="import-dockerfile"
  className="ml-2 px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 cursor-pointer inline-block"
>
  Импорт Dockerfile
</label>
<input
  type="file"
  accept=".dockerfile,Dockerfile"
  style={{ display: "none" }}
  id="import-dockerfile"
  onChange={async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!/\.dockerfile$/i.test(file.name) && file.name !== "Dockerfile") {
      alert("Можно импортировать только файлы с расширением .dockerfile или файл с именем Dockerfile");
      return;
    }
    const text = await file.text();
    setContent(text);
    setStages(dockerfileToStages(text));
  }}
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
  )}
  {!selectedFile && (
    <div className="text-gray-500 text-center mt-20">
      Выберите файл для редактирования
    </div>
  )}
</main>
    </div>
  );
}