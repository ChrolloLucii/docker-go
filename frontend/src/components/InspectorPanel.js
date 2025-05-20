import { DOCKER_HELP } from "./dockerHelp";

export default function InspectorPanel({ instruction }) {
  const info = DOCKER_HELP[instruction.type] || {};
  return (
    <div className="absolute left-full top-0 ml-4 w-80 bg-white dark:bg-gray-900 border rounded shadow-lg p-4 z-10 animate-fadein">
      <div className="font-bold text-lg mb-2">{instruction.type}</div>
      <div className="text-gray-700 dark:text-gray-200 text-sm mb-2">{info.desc}</div>
      {info.bestPractice && (
        <div className="text-xs text-blue-600 dark:text-blue-400 mb-2">
          <b>Best practice:</b> {info.bestPractice}
        </div>
      )}
      {info.example && (
        <pre className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs mb-2">{info.example}</pre>
      )}
      {info.link && (
        <a href={info.link} target="_blank" rel="noopener" className="text-blue-500 underline text-xs">
          Документация
        </a>
      )}
    </div>
  );
}