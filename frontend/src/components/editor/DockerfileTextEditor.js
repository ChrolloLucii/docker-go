export default function DockerfileTextEditor({ content, onChange, lintOutput }) {
  return (
    <div className="flex bg-white dark:bg-white/5 rounded-lg border p-2 relative">
      <div
        className="text-right select-none pr-2 text-gray-400"
        style={{ minWidth: 32, userSelect: "none" }}
        aria-hidden
      >
        {content.split('\n').map((_, i) => (
          <div key={i} style={{ height: 24, lineHeight: "24px" }}>{i + 1}</div>
        ))}
      </div>
      <textarea
        className="flex-1 bg-transparent outline-none resize-none"
        style={{ minHeight: 200, fontFamily: "monospace", lineHeight: "24px" }}
        value={content}
        onChange={onChange}
        spellCheck={false}
        rows={content.split('\n').length || 1}
      />
    </div>
  );
}
