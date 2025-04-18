const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ Puppeteer PDF Server is running');
});

app.post('/generate', async (req, res) => {
  const url = req.body.url || 'https://example.com';
  const id = crypto.randomBytes(4).toString('hex');
  const filePath = path.join(__dirname, `output-${id}.pdf`);

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
     args: ['--no-sandbox', '--disable-setuid-sandbox'],
  cacheDirectory: '/opt/render/.cache/puppeteer'
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm' }
    });

    await browser.close();

    res.download(filePath, 'generated.pdf', err => {
      fs.unlink(filePath, () => {}); // delete even if error
      if (err) console.error('Download error:', err);
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Puppeteer PDF API listening at http://localhost:${PORT}`);
});
