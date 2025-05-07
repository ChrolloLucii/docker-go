import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";

const DEFAULT_STAGES = [
    {
      id: "stage-1",
      name: "Stage 1",
      instructions: [
        { id: "1", type: "FROM", value: "node:18-alpine as builder" },
        { id: "2", type: "WORKDIR", value: "/app" },
        { id: "3", type: "COPY", value: "." },
      ],
    },
  ];

const DOCKER_INSTRUCTIONS = [
  "FROM", "WORKDIR", "COPY", "RUN", "CMD", "ENV", "EXPOSE", "ENTRYPOINT", "ARG", "USER", "VOLUME", "LABEL"
];

// Drag handle SVG
function DragHandle(props) {
  return (
    <span
      {...props}
      className="cursor-grab px-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      tabIndex={-1}
      aria-label="Перетащить"
      style={{ display: "flex", alignItems: "center" }}
    >
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <circle cx="5" cy="5" r="1.5" fill="currentColor"/>
        <circle cx="5" cy="9" r="1.5" fill="currentColor"/>
        <circle cx="5" cy="13" r="1.5" fill="currentColor"/>
        <circle cx="13" cy="5" r="1.5" fill="currentColor"/>
        <circle cx="13" cy="9" r="1.5" fill="currentColor"/>
        <circle cx="13" cy="13" r="1.5" fill="currentColor"/>
      </svg>
    </span>
  );
}

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children(listeners)}
    </div>
  );
}

export default function DockerFileEditorVisual({ stages: initialStages, onChange }) {
  const [stages, setStages] = useState(initialStages || DEFAULT_STAGES);
  const [activeStage, setActiveStage] = useState(stages[0].id);

  const currentStage = stages.find(s => s.id === activeStage);

  // Drag & Drop reorder
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = currentStage.instructions.findIndex(i => i.id === active.id);
      const newIndex = currentStage.instructions.findIndex(i => i.id === over.id);
      const newInstructions = arrayMove(currentStage.instructions, oldIndex, newIndex);
      updateStageInstructions(activeStage, newInstructions);
    }
  };

  function updateStageInstructions(stageId, newInstructions) {
    setStages(stages =>
      stages.map(s =>
        s.id === stageId ? { ...s, instructions: newInstructions } : s
      )
    );
    onChange?.(stages);
  }

  function handleAddInstruction() {
    const newInstruction = {
      id: uuidv4(),
      type: "RUN",
      value: "",
    };
    updateStageInstructions(activeStage, [...currentStage.instructions, newInstruction]);
  }
  function handleAddStage() {
    const newStage = {
      id: `stage-${uuidv4()}`,
      name: `Stage ${stages.length + 1}`,
      instructions: [],
    };
    setStages([...stages, newStage]);
    setActiveStage(newStage.id);
  }
  function handleInstructionChange(idx, field, value) {
    const newInstructions = currentStage.instructions.map((ins, i) =>
      i === idx ? { ...ins, [field]: value } : ins
    );
    updateStageInstructions(activeStage, newInstructions);
  }

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-950 rounded-xl shadow p-6">
      {/* Stage Switcher */}
      <div className="flex gap-2 mb-4">
        {stages.map(stage => (
          <button
            key={stage.id}
            className={`px-3 py-1 rounded ${stage.id === activeStage ? "bg-black text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"}`}
            onClick={() => setActiveStage(stage.id)}
          >
            {stage.name}
          </button>
        ))}
        <button
          className="ml-2 px-3 py-1 rounded bg-green-600 text-white"
          onClick={() => {
            const newStage = {
                id: `stage-${uuidv4()}`,
                name: `Stage ${stages.length + 1}`,
                instructions: [],
              };
              setStages([...stages, newStage]);
              setActiveStage(newStage.id);
          }}
        >
          + Этап
        </button>
      </div>

      {/* Drag & Drop Instructions */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={currentStage.instructions.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {currentStage.instructions.map((ins, idx) => (
            <SortableItem key={ins.id} id={ins.id}>
              {(dragListeners) => (
                <div
                  key={ins.id}
                  className="flex items-center gap-2 mb-2 p-2 rounded border bg-gray-50 dark:bg-gray-900"
                >
                  <DragHandle {...dragListeners} />
                  <select
                    className="border rounded px-2 py-1"
                    value={ins.type}
                    onChange={e => handleInstructionChange(idx, "type", e.target.value)}
                  >
                    {DOCKER_INSTRUCTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <input
                    className="flex-1 border rounded px-2 py-1"
                    value={ins.value}
                    onChange={e => handleInstructionChange(idx, "value", e.target.value)}
                    placeholder="Параметры инструкции"
                  />
                  <button
                    className="text-red-500 px-2"
                    onClick={() => {
                      const newInstructions = currentStage.instructions.filter((_, i) => i !== idx);
                      updateStageInstructions(activeStage, newInstructions);
                    }}
                    title="Удалить"
                  >✕</button>
                </div>
              )}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      <button
        className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        onClick={handleAddInstruction}
      >
        + Добавить инструкцию
      </button>
    </div>
  );
}