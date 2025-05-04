import Link from "next/link";

export default function ProjectCard({ project }) {
  return (
    <li className="group relative border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-950 shadow-sm hover:shadow-xl transition-all duration-200 p-6 flex flex-col justify-between overflow-hidden">
      {/* SVG круг и логомарка */}
      <div className="absolute right-6 top-6 opacity-10 group-hover:opacity-20 transition">
        <svg width="48" height="48" viewBox="0 0 180 180" fill="none">
          <circle cx="90" cy="90" r="90" fill="black" />
          <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="white" fillOpacity="0.7"/>
        </svg>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition">
            {project.name}
          </span>
        </div>
        <div className="text-gray-500 text-sm mb-4 min-h-[32px]">
          {project.description || <span className="italic text-gray-400">Нет описания</span>}
        </div>
      </div>
      <Link
        href={`/projects/${project.id}/editor`}
        className="inline-flex items-center gap-1 text-sm font-medium text-black dark:text-white hover:underline mt-2"
      >
        <svg width="16" height="16" fill="none" className="mr-1" viewBox="0 0 16 16">
          <path d="M4 8h8M8 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Открыть редактор
      </Link>
    </li>
  );
}