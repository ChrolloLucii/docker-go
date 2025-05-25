export default function EditorToolbar({ onSave, onExport, onImport }) {
  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={onSave}
        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
      >
        Сохранить
      </button>
      <button
        className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
        onClick={onExport}
      >
        Экспорт Dockerfile
      </button>
      <label
        htmlFor="import-dockerfile"
        className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 cursor-pointer inline-block"
      >
        Импорт Dockerfile
      </label>
      <input
        type="file"
        accept=".dockerfile,Dockerfile"
        style={{ display: "none" }}
        id="import-dockerfile"
        onChange={onImport}
      />
    </div>
  );
}
