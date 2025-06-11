import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function buildAndRun(req, res) {
  const { dockerfileContent, projectId } = req.body;
  const userId = req.user.id;
  
  if (!dockerfileContent) {
    return res.status(400).json({ error: 'Dockerfile content is required' });
  }

  // Валидация Dockerfile
  const validationResult = validateDockerfile(dockerfileContent);
  if (!validationResult.isValid) {
    return res.status(400).json({ 
      error: 'Ошибка в Dockerfile', 
      details: validationResult.errors 
    });
  }

  const buildId = uuidv4();
  const buildDir = path.join(process.cwd(), 'temp', buildId);
  
  try {
    await fs.mkdir(buildDir, { recursive: true });
    
    const dockerfilePath = path.join(buildDir, 'Dockerfile');
    await fs.writeFile(dockerfilePath, dockerfileContent);
    
    // Если в Dockerfile есть COPY . ., но нет исходников, создаём минимальный app.js
    if (dockerfileContent.includes('COPY . .')) {
      const files = await fs.readdir(buildDir);
      // Если нет app.js, index.js и server.js, создаём app.js
      if (!files.includes('app.js') && !files.includes('index.js') && !files.includes('server.js')) {
        const minimalApp = `
const http = require('http');
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>🐳 Минимальное Node.js приложение работает!</h1>');
}).listen(port, () => {
  console.log('Server running on port', port);
});
`;
        await fs.writeFile(path.join(buildDir, 'app.js'), minimalApp);
      }
    }
    // ГАРАНТИРОВАННО создаём server.js для Node.js проектов, если его нет
    if ((dockerfileContent.includes('node:') || dockerfileContent.includes('npm')) && !(await fs.readdir(buildDir)).includes('server.js')) {
      const serverJs = `
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(\`
    <!DOCTYPE html>
    <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Docker Test App</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 40px; background: #f0f0f0;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1>🐳 Приложение успешно запущено!</h1>
          <p><strong>Проект ID:</strong> ${projectId}</p>
          <p><strong>Build ID:</strong> ${buildId}</p>
          <p><strong>Время:</strong> "+ new Date().toLocaleString('ru-RU') +"</p>
          <p><strong>Порт:</strong> "+ (process.env.PORT || 3000) +"</p>
          <hr>
          <p>✅ Docker контейнер работает корректно</p>
          <p>🚀 Express сервер запущен</p>
        </div>
      </body>
    </html>
  \`);
});

app.listen(port, '0.0.0.0', () => {
  console.log(\`Server running on port \${port}\`);
});
      `;
      await fs.writeFile(path.join(buildDir, 'server.js'), serverJs);
    } else {
      // Создаем простой index.html для веб-приложений
      const indexHtml = `
                <!DOCTYPE html>
        <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Docker Test</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f0f0f0; }
            .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🐳 Docker контейнер работает!</h1>
            <p><strong>Проект ID:</strong> ${projectId}</p>
            <p><strong>Build ID:</strong> ${buildId}</p>
            <p><strong>Время:</strong> ${new Date().toLocaleString('ru-RU')}</p>
            <hr>
            <p>✅ Статический сайт развернут</p>
            <p>🌐 Nginx сервер работает</p>
          </div>
        </body>
        </html>
      `;
      await fs.writeFile(path.join(buildDir, 'index.html'), indexHtml, 'utf8');
    }
    
    const imageName = `user-${userId}-project-${projectId}-${buildId}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const containerName = `${imageName}-container`;
    
    try {
      await executeCommand(`docker stop ${containerName}`);
    } catch (e) {

    }
    
    try {
      await executeCommand(`docker rm ${containerName}`);
    } catch (e) {
    }
    
    // Собираем образ с timeout
    const buildResult = await executeCommandWithTimeout(
      `docker build -t ${imageName} .`,
      { cwd: buildDir },
      60000 // 60 секунд
    );
    console.log('Docker build stdout:', buildResult.stdout);
    console.log('Docker build stderr:', buildResult.stderr);
    
    // Определяем порт контейнера и хоста
    const containerPort = dockerfileContent.includes('EXPOSE') 
      ? dockerfileContent.match(/EXPOSE\s+(\d+)/)?.[1] || '80'
      : '80';
    const hostPort = 3000 + (parseInt(userId.slice(-3), 16) % 1000);
    
    // Запускаем контейнер
    let runResult;
    try {
      runResult = await executeCommand(
        `docker run -d -p ${hostPort}:${containerPort} --name ${containerName} ${imageName}`
      );
      console.log('Docker run stdout:', runResult.stdout);
      console.log('Docker run stderr:', runResult.stderr);
    } catch (runErr) {
      console.error('Docker run error:', runErr);
      // Получаем список контейнеров и их статусы
      try {
        const psAll = await executeCommand(`docker ps -a --filter "name=${containerName}" --format "{{.Names}}: {{.Status}}"`);
        console.log('docker ps -a:', psAll.stdout);
      } catch (e) {
        console.error('docker ps -a error:', e);
      }
      return res.status(500).json({
        error: 'Ошибка запуска контейнера',
        buildId,
        imageName,
        containerName,
        containerPort,
        hostPort,
        buildOutput: buildResult.stdout + buildResult.stderr,
        runOutput: runErr.stdout + runErr.stderr,
        logs: 'Контейнер не был запущен. См. buildOutput и runOutput.'
      });
    }

    // Проверяем, что контейнер реально работает
    let isRunning = false;
    try {
      const psResult = await executeCommand(`docker ps --filter "name=${containerName}" --format "{{.Names}}"`);
      isRunning = psResult.stdout.trim().includes(containerName);
      console.log('docker ps result:', psResult.stdout);
    } catch (e) {
      console.error('docker ps error:', e);
    }

    if (!isRunning) {
      // Получаем логи контейнера
      let logs = '';
      try {
        const logsResult = await executeCommand(`docker logs ${containerName}`);
        logs = logsResult.stdout + logsResult.stderr;
        console.log('docker logs:', logs);
      } catch (e) {
        logs = 'Не удалось получить логи контейнера.';
        console.error('docker logs error:', e);
      }
      // Получаем docker inspect
      try {
        const inspectResult = await executeCommand(`docker inspect ${containerName}`);
        console.log('docker inspect:', inspectResult.stdout);
      } catch (e) {
        console.error('docker inspect error:', e);
      }
      return res.status(500).json({
        error: 'Контейнер не запущен или завершился с ошибкой',
        buildId,
        imageName,
        containerName,
        containerPort,
        hostPort,
        buildOutput: buildResult.stdout + buildResult.stderr,
        runOutput: runResult.stdout + runResult.stderr,
        logs
      });
    }

    res.json({
      success: true,
      buildId,
      imageName,
      containerName,
      containerPort,
      hostPort,
      url: `http://localhost:${hostPort}`,
      buildOutput: buildResult.stdout,
      runOutput: runResult.stdout
    });
    
  } catch (error) {
    console.error('Docker build/run error:', error);
    res.status(500).json({
      error: 'Failed to build or run Docker container',
      details: error.message,
      suggestion: getErrorSuggestion(error.message)
    });
  } finally {

    try {
      await fs.rm(buildDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp directory:', cleanupError);
    }
  }
}

export async function stopContainer(req, res) {
  const { containerName } = req.params;
  const userId = req.user.id;
  

  if (!containerName.includes(`user-${userId}`)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    try {
      await executeCommand(`docker stop ${containerName}`);
    } catch (e) {
    }
    
    try {
      await executeCommand(`docker rm ${containerName}`);
    } catch (e) {
    }
    
    res.json({ success: true, message: 'Container stopped and removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop container', details: error.message });
  }
}

export async function getContainerLogs(req, res) {
  const { containerName } = req.params;
  const userId = req.user.id;
  
  if (!containerName.includes(`user-${userId}`)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    const result = await executeCommand(`docker logs ${containerName}`);
    res.json({ logs: result.stdout + result.stderr });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get logs', details: error.message });
  }
}

function validateDockerfile(content) {
  const errors = [];
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Проверяем, что есть FROM
  if (!lines.some(line => line.toUpperCase().startsWith('FROM'))) {
    errors.push('Dockerfile должен начинаться с инструкции FROM');
  }
  
  // Проверяем опасные команды
  const dangerousCommands = ['rm -rf /', 'sudo', 'chmod 777'];
  lines.forEach((line, index) => {
    dangerousCommands.forEach(dangerous => {
      if (line.toLowerCase().includes(dangerous)) {
        errors.push(`Строка ${index + 1}: Опасная команда "${dangerous}"`);
      }
    });
  });
  
  // Проверяем правильность RUN команд для Node.js
  lines.forEach((line, index) => {
    if (line.toUpperCase().startsWith('RUN')) {
      const command = line.substring(3).trim();
      if (command === 'install') {
        errors.push(`Строка ${index + 1}: Используйте "RUN npm install" вместо "RUN install"`);
      }
      if (command.includes('npm run dev') && !command.includes('npm install')) {
        errors.push(`Строка ${index + 1}: Добавьте "npm install" перед "npm run dev"`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function getErrorSuggestion(errorMessage) {
  if (errorMessage.includes('install')) {
    return 'Попробуйте использовать "RUN npm install" вместо "RUN install"';
  }
  if (errorMessage.includes('not found')) {
    return 'Убедитесь, что все команды написаны правильно и установлены в базовом образе';
  }
  if (errorMessage.includes('permission denied')) {
    return 'Проблема с правами доступа. Попробуйте добавить USER root';
  }
  if (errorMessage.includes('No such container')) {
    return 'Контейнер не найден или уже остановлен';
  }
  return 'Проверьте синтаксис Dockerfile';
}

function executeCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function executeCommandWithTimeout(command, options, timeout) {
  return new Promise((resolve, reject) => {
    const child = exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
    
    setTimeout(() => {
      child.kill();
      reject(new Error('Command timeout'));
    }, timeout);
  });
}
export async function getContainerStatus(req, res) {
  const { containerName } = req.params; 
  const userId = req.user.id;
  
  if (!containerName.includes(`user-${userId}`)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    const result = await executeCommand(`docker ps --filter "name=${containerName}" --format "{{.Names}}"`);
    const isRunning = result.stdout.trim().includes(containerName);
    
    res.json({ isRunning, containerName });
  } catch (error) {
    res.json({ isRunning: false, containerName });
  }
}

export async function cleanupAllContainers(req, res) {
  const userId = req.user.id;

  console.log('Cleanup request from user:', userId);

  try {
    const listResult = await executeCommand(`docker ps -a --filter "name=user-${userId}" --format "{{.Names}}"`);
    const containerNames = listResult.stdout.split('\n').filter(name => name.trim());

    console.log('Found containers:', containerNames);

    let cleanedCount = 0;
    const errors = [];

    for (const containerName of containerNames) {
      if (!containerName.includes(`user-${userId}`)) {
        console.log('Пропуск чужого контейнера:', containerName, 'для userId:', userId);
        continue;
      }
      try {
        try {
          await executeCommand(`docker stop ${containerName}`);
        } catch (e) {}
        try {
          await executeCommand(`docker rm ${containerName}`);
        } catch (e) {}
        cleanedCount++;
      } catch (e) {
        errors.push(`Ошибка с контейнером ${containerName}: ${e.message}`);
      }
    }

    res.json({
      success: true,
      message: `Очищено ${cleanedCount} контейнеров`,
      cleanedContainers: containerNames,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      error: 'Failed to cleanup containers',
      details: error.message
    });
  }
}