import { useState } from 'react';
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiPlus, FiTrash2, FiMove, FiChevronDown, FiChevronRight, FiInfo, FiX } from 'react-icons/fi';
import { v4 as uuidv4 } from "uuid";

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 2 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children(listeners)}
    </div>
  );
}

const INSTRUCTION_DOCS = {
  FROM: `**FROM** — задаёт базовый образ для сборки.  
Формат: \`FROM &lt;image&gt; [:tag] [AS &lt;name&gt;]\`
  
Пример:  
\`FROM node:18-alpine AS builder\``,
  RUN: `**RUN** — выполняет команду на этапе сборки образа.  
Формат: \`RUN &lt;command&gt;\`
  
Пример:  
\`RUN apt-get update && apt-get install -y curl\``,
  CMD: `**CMD** — команда по умолчанию для запуска контейнера.  
Формат: \`CMD ["executable","param1","param2"]\` или \`CMD command param1 param2\`
  
Пример:  
\`CMD ["npm", "start"]\``,
  COPY: `**COPY** — копирует файлы/папки из контекста сборки в образ.  
Формат: \`COPY &lt;src&gt; &lt;dest&gt;\`
  
Пример:  
\`COPY . /app\``,
  ADD: `**ADD** — как COPY, но поддерживает URL и автоматическую распаковку архивов.  
Формат: \`ADD &lt;src&gt; &lt;dest&gt;\`
  
Пример:  
\`ADD https://example.com/file.tar.gz /tmp/\``,
  WORKDIR: `**WORKDIR** — задаёт рабочую директорию для следующих инструкций.  
Формат: \`WORKDIR &lt;path&gt;\`
  
Пример:  
\`WORKDIR /app\``,
  ENV: `**ENV** — устанавливает переменные окружения.  
Формат: \`ENV &lt;key&gt;=&lt;value&gt; ...\`
  
Пример:  
\`ENV NODE_ENV=production\``,
  EXPOSE: `**EXPOSE** — сообщает о портах, которые контейнер слушает во время работы.  
Формат: \`EXPOSE &lt;port&gt; [&lt;port&gt;/&lt;protocol&gt;]\`
  
Пример:  
\`EXPOSE 3000\``,
  VOLUME: `**VOLUME** — создаёт точку монтирования для хранения данных.  
Формат: \`VOLUME ["/data"]\`
  
Пример:  
\`VOLUME /data\``,
  USER: `**USER** — задаёт пользователя для выполнения следующих инструкций.  
Формат: \`USER &lt;username&gt;[:&lt;groupname&gt;]\`
  
Пример:  
\`USER node\``,
  LABEL: `**LABEL** — добавляет метаданные к образу.  
Формат: \`LABEL &lt;key&gt;=&lt;value&gt; ...\`
  
Пример:  
\`LABEL version="1.0"\``,
  ENTRYPOINT: `**ENTRYPOINT** — задаёт исполняемый файл контейнера.  
Формат: \`ENTRYPOINT ["executable", "param1", ...]\`
  
Пример:  
\`ENTRYPOINT ["node", "index.js"]\``
};

export default function DockerFileEditorVisual({ stages, onChange }) {
  const [activeStage, setActiveStage] = useState(stages[0]?.id || "stage-1");
  const [activeInstruction, setActiveInstruction] = useState(null);
  const [docOpen, setDocOpen] = useState({});

  const currentStage = stages.find(s => s.id === activeStage) || stages[0];

  function updateStageInstructions(stageId, newInstructions) {
    const newStages = stages.map(s =>
      s.id === stageId ? { ...s, instructions: newInstructions } : s
    );
    onChange?.(newStages);
  }

  function handleAddInstruction(type = "RUN") {
    const newInstruction = {
      id: uuidv4(),
      type,
      value: "",
      expanded: true
    };
    updateStageInstructions(activeStage, [...currentStage.instructions, newInstruction]);
  }

  function handleAddStage() {
    const newStageId = uuidv4();
    const newStage = {
      id: newStageId,
      name: `Stage ${stages.length + 1}`,
      instructions: [{
        id: uuidv4(),
        type: "FROM",
        value: "",
        expanded: true
      }]
    };
    onChange?.([...stages, newStage]);
    setActiveStage(newStageId);
  }

  function handleRemoveStage(stageId) {
    if (stages.length <= 1) return;
    
    const newStages = stages.filter(s => s.id !== stageId);
    onChange?.(newStages);
    
    // Переключаемся на первую оставшуюся стадию
    if (activeStage === stageId) {
      setActiveStage(newStages[0].id);
    }
  }

  function handleInstructionChange(idx, field, value) {
    const newInstructions = currentStage.instructions.map((ins, i) =>
      i === idx ? { ...ins, [field]: value } : ins
    );
    
    // Если добавили FROM инструкцию, создаём новую стадию
    if (field === 'type' && value === 'FROM' && idx > 0) {
      // Разделяем инструкции на две стадии
      const beforeInstructions = newInstructions.slice(0, idx);
      const fromAndAfter = newInstructions.slice(idx);
      
      // Обновляем текущую стадию
      updateStageInstructions(activeStage, beforeInstructions);
      
      // Создаём новую стадию
      const newStageId = uuidv4();
      const newStage = {
        id: newStageId,
        name: `Stage ${stages.length + 1}`,
        instructions: fromAndAfter
      };
      
      onChange?.([...stages, newStage]);
      setActiveStage(newStageId);
    } else {
      updateStageInstructions(activeStage, newInstructions);
    }
  }

  function handleRemoveInstruction(idx) {
    const newInstructions = currentStage.instructions.filter((_, i) => i !== idx);
    updateStageInstructions(activeStage, newInstructions);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = currentStage.instructions.findIndex(i => i.id === active.id);
      const newIndex = currentStage.instructions.findIndex(i => i.id === over.id);
      const newInstructions = arrayMove(currentStage.instructions, oldIndex, newIndex);
      updateStageInstructions(activeStage, newInstructions);
    }
  }

  return (
    <div className="visual-editor">
      {/* Multi-stage Tabs */}
      {stages.length > 1 && (
        <div className="stages-tabs">
          <div className="tabs-container">
             {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`stage-tab ${stage.id === activeStage ? 'active' : ''}`}
            >
              <div
                className="stage-content"
                onClick={() => setActiveStage(stage.id)}
              >
                <span className="stage-number">{index + 1}</span>
                <span className="stage-name">{stage.name}</span>
              </div>
              {stages.length > 1 && (
                <button
                  className="stage-remove"
                  onClick={() => handleRemoveStage(stage.id)}
                  title="Удалить стадию"
                >
                  <FiX />
                </button>
              )}
            </div>
          ))}
            <button className="add-stage-btn" onClick={handleAddStage} title="Добавить стадию">
              <FiPlus />
              <span>Новая стадия</span>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="visual-editor-header">
        <h3>
          Dockerfile инструкции
          {stages.length > 1 && (
            <span className="stage-indicator">
              — {currentStage.name}
            </span>
          )}
        </h3>
        <div className="header-actions">
          <select
            className="instruction-select"
            onChange={e => {
              if (e.target.value) {
                handleAddInstruction(e.target.value);
                e.target.value = '';
              }
            }}
            value=""
          >
            <option value="">Добавить инструкцию</option>
            {INSTRUCTION_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <button className="btn-add" onClick={() => handleAddInstruction()}>
            <FiPlus /> Добавить
          </button>
        </div>
      </div>

      {/* Instructions List */}
      <div className="instructions-list">
        {currentStage.instructions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>Dockerfile пуст</p>
            <button className="btn-primary" onClick={() => handleAddInstruction('FROM')}>
              Начать с FROM
            </button>
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={currentStage.instructions.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {currentStage.instructions.map((instruction, idx) => (
                <SortableItem key={instruction.id} id={instruction.id}>
                  {(dragListeners) => (
                    <div
                      className={`instruction-card`}
                      onClick={() => setActiveInstruction(instruction.id)}
                    >
                      <div className="instruction-header">
                        <div className="instruction-number">{idx + 1}</div>
                        <div className="instruction-drag" {...dragListeners}><FiMove /></div>
                        <select
                          className="instruction-type"
                          value={instruction.type}
                          onChange={e => handleInstructionChange(idx, "type", e.target.value)}
                        >
                          {INSTRUCTION_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <button
                          className="instruction-toggle"
                          onClick={() => handleInstructionChange(idx, 'expanded', !instruction.expanded)}
                        >
                          {instruction.expanded ? <FiChevronDown /> : <FiChevronRight />}
                        </button>
                        <button
                          className="instruction-doc"
                          title="Документация"
                          onClick={e => {
                            e.stopPropagation();
                            setDocOpen(prev => ({
                              ...prev,
                              [instruction.id]: !prev[instruction.id]
                            }));
                          }}
                        >
                          <FiInfo />
                        </button>
                        <button
                          className="instruction-delete"
                          onClick={e => { e.stopPropagation(); handleRemoveInstruction(idx); }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      {instruction.expanded && (
                        <div className="instruction-body">
                          <textarea
                            className="instruction-args"
                            placeholder={getPlaceholder(instruction.type)}
                            value={instruction.value}
                            onChange={e => handleInstructionChange(idx, 'value', e.target.value)}
                            rows={Math.max(1, instruction.value.split('\n').length)}
                          />
                          <div className="instruction-help">
                            {getHelpText(instruction.type)}
                          </div>
                          {docOpen[instruction.id] && (
                            <div className="instruction-doc-popup">
                              <div className="doc-content" 
                              dangerouslySetInnerHTML={{
                              __html:
                                (INSTRUCTION_DOCS[instruction.type] || "Нет подробной документации")
                                  .replace(/</g, '&lt;')
                                  .replace(/>/g, '&gt;')
                                  .replace(/\n/g, '<br>')
                                  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
                                  .replace(/`([^`]+)`/g, '<code>$1</code>')
                            }} />
                              <button className="doc-close" onClick={e => { e.stopPropagation(); setDocOpen(prev => ({ ...prev, [instruction.id]: false })); }}>Закрыть</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
      
      <style jsx>{`
        .stages-tabs {
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 20px;
        }

        .tabs-container {
          display: flex;
          gap: 8px;
          align-items: center;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .tabs-container::-webkit-scrollbar {
          display: none;
        }

        .stage-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          position: relative;
        }

        .stage-tab:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.9);
        }

        .stage-tab.active {
          background: #6ec1e4;
          border-color: #6ec1e4;
          color: #000000;
        }

        .stage-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          font-size: 11px;
          font-weight: 600;
        }

        .stage-tab.active .stage-number {
          background: rgba(0, 0, 0, 0.2);
          color: #000000;
        }

        .stage-name {
          font-weight: 600;
        }

        .stage-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          background: rgba(255, 0, 0, 0.2);
          border: none;
          border-radius: 50%;
          color: #ff6b6b;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s ease;
          margin-left: 4px;
        }

        .stage-tab:hover .stage-remove {
          opacity: 1;
        }

        .stage-remove:hover {
          background: rgba(255, 0, 0, 0.4);
          color: #ffffff;
        }

        .add-stage-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: transparent;
          border: 1px dashed rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .add-stage-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.5);
          color: rgba(255, 255, 255, 0.9);
        }

        .stage-indicator {
          font-size: 14px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.6);
        }

        .instruction-doc {
          background: transparent;
          border: none;
          color: #6ec1e4;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .instruction-doc:hover {
          background: rgba(110, 193, 228, 0.1);
          color: #fff;
        }
        .instruction-doc-popup {
          margin-top: 12px;
          background: #181f2a;
          color: #fff;
          border: 1px solid #6ec1e4;
          border-radius: 8px;
          padding: 16px;
          font-size: 13px;
          position: relative;
          z-index: 10;
        }
        .doc-content code {
          background: #23272e;
          color: #6ec1e4;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 12px;
        }
        .doc-content b {
          color: #6ec1e4;
        }
        .doc-close {
          margin-top: 12px;
          background: #6ec1e4;
          color: #181f2a;
          border: none;
          border-radius: 4px;
          padding: 4px 12px;
          font-size: 12px;
          cursor: pointer;
        }
        
        .visual-editor {
          height: 100%;
          background: #000000;
          color: #ffffff;
          display: flex;
          flex-direction: column;
        }

        .visual-editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
        }

        .visual-editor-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .instruction-select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: #ffffff;
          padding: 8px 12px;
          font-size: 14px;
        }

        .instruction-select option {
          background: #1a1a1a;
          color: #ffffff;
        }

        .btn-add {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          color: #000000;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-add:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
        }

        .instructions-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state p {
          margin: 0 0 20px 0;
          font-size: 16px;
        }

        .btn-primary {
          background: #ffffff;
          color: #000000;
          border: none;
          border-radius: 6px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
        }

        .instruction-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          margin-bottom: 12px;
          transition: all 0.2s ease;
          cursor: move;
        }

        .instruction-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .instruction-card.dragging {
          opacity: 0.5;
          transform: scale(0.95);
        }

        .instruction-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
        }

        .instruction-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          font-size: 12px;
          font-weight: 600;
        }

        .instruction-drag {
          color: rgba(255, 255, 255, 0.4);
          cursor: move;
        }

        .instruction-type {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: #ffffff;
          padding: 6px 12px;
          font-size: 14px;
          font-weight: 600;
          min-width: 100px;
        }

        .instruction-type option {
          background: #1a1a1a;
          color: #ffffff;
        }

        .instruction-toggle, .instruction-delete {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .instruction-toggle:hover, .instruction-delete:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
        }

        .instruction-delete:hover {
          color: #ff4444;
        }

        .instruction-body {
          padding: 0 16px 16px 16px;
        }

        .instruction-args {
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #ffffff;
          padding: 12px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          line-height: 1.4;
          resize: vertical;
          min-height: 40px;
        }

        .instruction-args:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.3);
        }

        .instruction-args::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .instruction-help {
          margin-top: 8px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .visual-editor-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
          
          .header-actions {
            justify-content: space-between;
          }
          
          .instruction-header {
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .instruction-type {
            min-width: auto;
            flex: 1;
          }
          
          .stages-tabs {
            padding: 8px 16px;
          }
          
          .tabs-container {
            gap: 4px;
          }
          
          .stage-tab, .add-stage-btn {
            padding: 6px 8px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}

const INSTRUCTION_TYPES = [
  'FROM', 'RUN', 'CMD', 'LABEL', 'EXPOSE', 'ENV',
  'ADD', 'COPY', 'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR'
];

function getPlaceholder(instruction) {
  const placeholders = {
    FROM: 'ubuntu:20.04',
    RUN: 'apt-get update && apt-get install -y curl',
    CMD: '["npm", "start"]',
    COPY: '. /app',
    ADD: 'https://example.com/file.tar.gz /tmp/',
    WORKDIR: '/app',
    ENV: 'NODE_ENV=production',
    EXPOSE: '3000',
    VOLUME: '/data',
    USER: 'node',
    LABEL: 'version="1.0"',
    ENTRYPOINT: '["node", "index.js"]'
  };
  return placeholders[instruction] || '';
}

function getHelpText(instruction) {
  const helpTexts = {
    FROM: 'Базовый образ для создания контейнера',
    RUN: 'Выполнить команду во время сборки образа',
    CMD: 'Команда по умолчанию при запуске контейнера',
    COPY: 'Копировать файлы из контекста сборки в образ',
    ADD: 'Копировать файлы (поддерживает URL и tar архивы)',
    WORKDIR: 'Установить рабочую директорию',
    ENV: 'Установить переменную окружения',
    EXPOSE: 'Указать порт, который будет прослушивать контейнер',
    VOLUME: 'Создать точку монтирования',
    USER: 'Установить пользователя для выполнения команд',
    LABEL: 'Добавить метаданные к образу',
    ENTRYPOINT: 'Настроить контейнер как исполняемый файл'
  };
  return helpTexts[instruction] || '';
}