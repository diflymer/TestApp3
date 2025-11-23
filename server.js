const express = require('express');
const puppeteer = require('puppeteer-core');
const axios = require('axios');
const cheerio = require('cheerio');
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
  let browser = null;
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string' || url.trim() === '') {
      return res.status(400).send('URL parameter is required and must be a valid string');
    }

    // Basic URL validation
    let validUrl;
    try {
      validUrl = new URL(url.trim());
      if (!validUrl.protocol.startsWith('http')) {
        return res.status(400).send('URL must use HTTP or HTTPS protocol');
      }
    } catch (e) {
      return res.status(400).send('Invalid URL format');
    }

    // Try to launch browser with Puppeteer
    try {
      browser = await puppeteer.launch({
        headless: 'new', // Use new headless mode
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--single-process', // Run in single process mode
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-software-rasterizer',
          '--remote-debugging-port=9222',
          '--user-data-dir=/tmp/chrome-user-data'
        ],
        ignoreDefaultArgs: ['--disable-extensions'],
        timeout: 60000 // Increase launch timeout
      });

      const page = await browser.newPage();

      // Set viewport
      await page.setViewport({ width: 1280, height: 720 });

      // Navigate to the provided URL
      await page.goto(validUrl.href, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Check if button exists
      const buttonExists = await page.$('#bt');
      if (!buttonExists) {
        return res.status(404).send('Button with id="bt" not found');
      }

      // Check if input field exists
      const inputExists = await page.$('#inp');
      if (!inputExists) {
        return res.status(404).send('Input field with id="inp" not found');
      }

      // Click the button
      await page.click('#bt');

      // Wait a moment for the page to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the value from the input field
      const value = await page.$eval('#inp', el => el.value || '');

      // Return the value as plain text
      res.setHeader('Content-Type', 'text/plain');
      res.send(value);

    } catch (browserError) {
      console.log('Browser launch failed, falling back to static parsing:', browserError.message);

      // Fallback to cheerio-based parsing
      try {
        const response = await axios.get(validUrl.href, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const $ = cheerio.load(response.data);
        const inputValue = $('#inp').val() || '';

        res.setHeader('Content-Type', 'text/plain');
        res.send(inputValue + ' (static parsing - no interaction)');

      } catch (staticError) {
        console.error('Static parsing also failed:', staticError.message);
        throw new Error(`Browser automation failed: ${browserError.message}. Static parsing also failed: ${staticError.message}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error: ' + error.message);
  } finally {
    // Close browser
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Error closing browser:', e);
      }
    }
  }
});

// Alternative route using cheerio (for static content only)
app.get('/test-static/', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string' || url.trim() === '') {
      return res.status(400).send('URL parameter is required and must be a valid string');
    }

    // Basic URL validation
    let validUrl;
    try {
      validUrl = new URL(url.trim());
      if (!validUrl.protocol.startsWith('http')) {
        return res.status(400).send('URL must use HTTP or HTTPS protocol');
      }
    } catch (e) {
      return res.status(400).send('Invalid URL format');
    }

    // Fetch HTML using axios
    const response = await axios.get(validUrl.href, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Parse HTML with cheerio
    const $ = cheerio.load(response.data);

    // Check if input field exists and get its value
    const inputValue = $('#inp').val() || '';

    // Return the value as plain text
    res.setHeader('Content-Type', 'text/plain');
    res.send(inputValue);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error: ' + error.message);
  }
});

const PORT = 3000;

// Для разработки используем HTTP сервер
// Для продакшена добавьте HTTPS с настоящими сертификатами
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
