const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(url);
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    if (audioFormat && audioFormat.url) {
      return res.json({ url: audioFormat.url });
    }
    res.status(404).json({ error: 'Kein Audiostream gefunden' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Proxy läuft auf Port ${PORT}`));
