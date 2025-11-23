const express = require('express');
const puppeteer = require('puppeteer');

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

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Navigate to the provided URL
    await page.goto(validUrl.href, { waitUntil: 'networkidle2', timeout: 30000 });

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

    // Wait a moment for the page to update (using setTimeout instead of deprecated waitForTimeout)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get the value from the input field
    const value = await page.$eval('#inp', el => el.value || '');

    // Return the value as plain text
    res.setHeader('Content-Type', 'text/plain');
    res.send(value);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error: ' + error.message);
  } finally {
    // Close browser
    if (browser) {
      await browser.close();
    }
  }
});

const PORT = 3000;

// Для разработки используем HTTP сервер
// Для продакшена добавьте HTTPS с настоящими сертификатами
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
