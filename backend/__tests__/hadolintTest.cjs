const { exec } = require("child_process");

const dockerfile = `FROM node:18-alpine
RUN echo Hello
EXPOSE not_a_number
`;

const child = exec("docker run --rm -i hadolint/hadolint", (err, stdout, stderr) => {
  if (stdout) {
    console.log("Hadolint output:\n", stdout);
  }
  if (stderr) {
    console.error("STDERR:", stderr);
  }
  if (err) {
    console.error("Error (code):", err.code);
    // Не return! Показываем вывод всегда
  }
});
child.stdin.write(dockerfile);
child.stdin.end();