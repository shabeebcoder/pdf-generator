const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ Puppeteer PDF Server is running');
});

app.post('/generate', async (req, res) => {
  const url = req.body.url || 'https://example.com';

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const filePath = path.join(__dirname, 'output.pdf');

    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm' }
    });

    await browser.close();

    res.download(filePath, 'output.pdf', err => {
      if (err) {
        console.error('Error sending file:', err);
      }
      fs.unlinkSync(filePath); // delete the file after sending
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
