const express = require('express');
const pug = require('pug');
const axios = require('axios');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// WordPress routes
app.get('/wordpress/', (req, res) => {
  // Simple WordPress-like homepage
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WordPress Site</title>
    </head>
    <body>
        <h1>Welcome to WordPress</h1>
        <div class="post">
            <h2>72457f98-f632-4204-8a92-eabc6e8b43a5</h2>
            <p>This is the main post with ID 1.</p>
        </div>
    </body>
    </html>
  `);
});

app.get('/wordpress/wp-json/wp/v2/posts', (req, res) => {
  // WordPress REST API posts endpoint
  res.json([
    {
      id: 1,
      title: {
        rendered: "72457f98-f632-4204-8a92-eabc6e8b43a5"
      },
      content: {
        rendered: "<p>This is the main post with ID 1.</p>"
      },
      status: "publish",
      type: "post"
    }
  ]);
});

app.get('/wordpress/wp-json/wp/v2/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  if (postId === 1) {
    res.json({
      id: 1,
      title: {
        rendered: "72457f98-f632-4204-8a92-eabc6e8b43a5"
      },
      content: {
        rendered: "<p>This is the main post with ID 1.</p>"
      },
      status: "publish",
      type: "post"
    });
  } else {
    res.status(404).json({ message: "Post not found" });
  }
});

// Render route
app.post('/render/', async (req, res) => {
  try {
    const { random2, random3 } = req.body;
    const addr = req.query.addr;

    if (!addr) {
      return res.status(400).json({ error: 'Missing addr query parameter' });
    }

    if (!random2 || !random3) {
      return res.status(400).json({ error: 'Missing random2 or random3 in request body' });
    }

    // Fetch the pug template from the provided URL
    const response = await axios.get(addr);
    const template = response.data;

    // Compile and render the pug template with the provided data
    const compiledFunction = pug.compile(template);
    const html = compiledFunction({ random2, random3 });

    res.send(html);
  } catch (error) {
    console.error('Error rendering template:', error);
    res.status(500).json({ error: 'Failed to render template' });
  }
});

app.get('/login/', (_, res) => {
  // Добавлен логин пользователя
  res.send('72457f98-f632-4204-8a92-eabc6e8b43a5');
});

const PORT = 3000;

// Для разработки используем HTTP сервер
// Для продакшена добавьте HTTPS с настоящими сертификатами
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
