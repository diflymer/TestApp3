const express = require('express');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const { execSync } = require('child_process');

// Set environment variables for better Puppeteer compatibility in Replit
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';

// Determine browser executable path
const getBrowserPath = () => {
  // Check various possible locations
  const possiblePaths = [
    process.env.CHROME_BIN,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/nix/store/*/bin/chromium',
    '/home/runner/.cache/puppeteer/chrome/*/chrome-linux64/chrome'
  ];

  for (const path of possiblePaths) {
    if (path && fs.existsSync(path)) {
      return path;
    }
  }

  // If running on Replit, try to find chromium in nix store
  try {
    const result = execSync('find /nix/store -name chromium -type f 2>/dev/null | head -1', { encoding: 'utf8' });
    if (result.trim()) {
      return result.trim();
    }
  } catch (e) {
    // Ignore errors
  }

  return undefined;
};

process.env.PUPPETEER_EXECUTABLE_PATH = getBrowserPath();

// Additional environment variables for Replit
process.env.LANG = 'en_US.UTF-8';
process.env.LANGUAGE = 'en_US.UTF-8';
process.env.LC_ALL = 'en_US.UTF-8';

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/login/', (_, res) => {
  // Добавлен логин пользователя
  res.send('72457f98-f632-4204-8a92-eabc6e8b43a5');
});

app.get('/test/', async (req, res) => {
  const targetURL = req.query.URL;

  // TODO: Заранее установить в систему chromium
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/chromium-browser', // Путь до chromium в системе
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Эта строка добавлена для моего VPS на Ubuntu 24.04
  })

  const page = await browser.newPage();
  await page.goto(targetURL, { waitUntil: 'networkidle2' });

  await page.click('#bt');

  await page.waitForFunction(() => {
    const input = document.querySelector('#inp');
    return input.value;
  }, { timeout: 1000 });

  const result = await page.evaluate(() => {
    return document.querySelector('#inp').value;
  });

  await browser.close();

  res.send(result);
});

const PORT = 3000;

// Для разработки используем HTTP сервер
// Для продакшена добавьте HTTPS с настоящими сертификатами
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
