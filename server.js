const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => res.send('Botify Proxy läuft'));

app.get('/stream/:id', async (req, res) => {
  const id = req.params.id;
  if (!ytdl.validateID(id)) return res.status(400).json({ error: 'Ungültige Video-ID' });
  try {
    const info = await ytdl.getInfo(id);
   let format;
try {
  format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
} catch (e) {
  // Fallback: irgendein Format mit Audio (auch Video+Audio gemischt)
  format = ytdl.chooseFormat(info.formats, { quality: 'lowest', filter: 'audioandvideo' });
}
console.log('Formate:', info.formats.length, 'Gewählt:', format.itag, format.mimeType);
    const headers = {};
    if (req.headers.range) headers.Range = req.headers.range; // Safari braucht Range-Support

    const upstream = await fetch(format.url, { headers });
    res.status(upstream.status);
    for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges']) {
      const v = upstream.headers.get(h);
      if (v) res.setHeader(h, v);
    }
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Läuft auf Port ${PORT}`));
