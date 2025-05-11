import axios from "axios";

export async function lintDockerfile(content) {
  const res = await axios.post("/api/lint", { content });
  return res.data; // строка с ошибками/предупреждениями hadolint
}