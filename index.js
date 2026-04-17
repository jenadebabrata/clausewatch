require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const watchList = {};

async function fetchPageText(url) {
  const response = await axios.get(url);
  return response.data.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function explainChanges(oldText, newText) {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [
        {
          role: 'user',
          content: `You are a legal assistant helping normal people understand terms of service changes.
          
OLD TEXT (first 1000 chars): ${oldText.substring(0, 1000)}

NEW TEXT (first 1000 chars): ${newText.substring(0, 1000)}

In simple plain English (no legal jargon):
1. What changed?
2. Does this affect the user? (Yes/No and why)
3. Impact score: rate this change 1-10 (10 = very serious)

Keep your answer short and clear.`
        }
      ]
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.choices[0].message.content;
}

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ClauseWatch</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 700px; margin: 60px auto; padding: 0 20px; background: #f9f9f9; }
        h1 { color: #1a1a1a; }
        p { color: #555; }
        input { width: 100%; padding: 12px; font-size: 16px; border: 1px solid #ddd; border-radius: 8px; margin: 10px 0; box-sizing: border-box; }
        button { background: #2563eb; color: white; border: none; padding: 12px 28px; font-size: 16px; border-radius: 8px; cursor: pointer; }
        button:hover { background: #1d4ed8; }
        .card { background: white; border: 1px solid #eee; border-radius: 12px; padding: 20px; margin: 16px 0; }
        .tag { display: inline-block; background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 20px; font-size: 12px; margin-bottom: 8px; }
        .changed { background: #fef2f2; border-color: #fca5a5; }
        .safe { background: #f0fdf4; border-color: #86efac; }
        pre { white-space: pre-wrap; font-family: Arial; font-size: 14px; color: #333; }
      </style>
    </head>
    <body>
      <h1>ClauseWatch</h1>
      <p>Paste any website URL below. ClauseWatch will monitor its terms and alert you when anything changes.</p>
      
      <form action="/watch" method="POST">
        <input type="url" name="url" placeholder="https://example.com/terms" required />
        <input type="text" name="label" placeholder="Give it a name (e.g. Netflix Terms)" required />
        <button type="submit">Start Watching</button>
      </form>

      <h2 style="margin-top:40px;">Currently Watching</h2>
      ${Object.keys(watchList).length === 0 
        ? '<p style="color:#aaa;">Nothing yet. Add a URL above to get started.</p>'
        : Object.entries(watchList).map(([url, data]) => `
          <div class="card ${data.changed ? 'changed' : 'safe'}">
            <div class="tag">${data.changed ? 'CHANGED' : 'No changes'}</div>
            <strong>${data.label}</strong><br/>
            <small style="color:#888;">${url}</small><br/>
            <small style="color:#aaa;">Last checked: ${data.lastChecked || 'Not yet'}</small>
            ${data.explanation ? `<hr/><pre>${data.explanation}</pre>` : ''}
          </div>
        `).join('')
      }

      <form action="/check-now" method="POST" style="margin-top:20px;">
        <button type="submit" style="background:#059669;">Check All URLs Now</button>
      </form>
    </body>
    </html>
  `);
});

app.post('/watch', async (req, res) => {
  const { url, label } = req.body;
  console.log(`Adding to watchlist: ${label} - ${url}`);
  try {
    const text = await fetchPageText(url);
    watchList[url] = {
      label,
      originalText: text,
      lastChecked: new Date().toLocaleString(),
      changed: false,
      explanation: null
    };
    console.log(`Successfully saved: ${label}`);
    res.redirect('/');
  } catch (err) {
    console.log(`Error fetching ${url}:`, err.message);
    res.send(`Error fetching that URL: ${err.message}. <a href="/">Go back</a>`);
  }
});

app.post('/check-now', async (req, res) => {
  console.log('Manually checking all URLs...');
  await checkAllUrls();
  res.redirect('/');
});

async function checkAllUrls() {
  for (const [url, data] of Object.entries(watchList)) {
    try {
      console.log(`Checking: ${url}`);
      const newText = await fetchPageText(url);
      data.lastChecked = new Date().toLocaleString();
      if (newText !== data.originalText) {
        console.log(`CHANGE DETECTED at: ${url}`);
        data.changed = true;
        data.explanation = await explainChanges(data.originalText, newText);
        data.originalText = newText;
      } else {
        console.log(`No change at: ${url}`);
        data.changed = false;
      }
    } catch (err) {
      console.log(`Error checking ${url}:`, err.message);
    }
  }
}

cron.schedule('0 9 * * *', () => {
  console.log('Daily check running...');
  checkAllUrls();
});

app.listen(3000, () => {
  console.log('');
  console.log('ClauseWatch is running!');
  console.log('Open your browser and go to: http://localhost:3000');
  console.log('');
});