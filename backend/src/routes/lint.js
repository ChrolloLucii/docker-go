import { Router } from "express";
import { exec } from "child_process";
const router = Router();

router.post("/", (req, res) => {
  const dockerfile = req.body.content;
  if (!dockerfile) return res.status(400).json({ error: "No content" });

  const child = exec("docker run --rm -i hadolint/hadolint", (err, stdout, stderr) => {
    // Всегда возвращаем stdout (даже если err)
    res.type("text/plain").send(stdout || stderr || "No output");
  });
  child.stdin.write(dockerfile);
  child.stdin.end();
});

export default router;