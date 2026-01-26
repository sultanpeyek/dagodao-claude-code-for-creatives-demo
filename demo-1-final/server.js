import express from 'express';
import { readdir, rename, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

const IMAGES_DIR = join(__dirname, 'organized-files');
const ARCHIVES_DIR = join(__dirname, 'archives');

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));
app.use('/images', express.static(IMAGES_DIR));

// Ensure archives directory exists
async function ensureArchivesDir() {
  if (!existsSync(ARCHIVES_DIR)) {
    await mkdir(ARCHIVES_DIR, { recursive: true });
  }
}

// Get list of images
app.get('/api/images', async (req, res) => {
  try {
    const files = await readdir(IMAGES_DIR);
    const images = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read images directory' });
  }
});

// Archive an image
app.post('/api/archive', async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'Filename required' });
    }

    await ensureArchivesDir();

    const sourcePath = join(IMAGES_DIR, filename);
    const destPath = join(ARCHIVES_DIR, filename);

    if (!existsSync(sourcePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    await rename(sourcePath, destPath);
    res.json({ success: true, archived: filename });
  } catch (error) {
    res.status(500).json({ error: 'Failed to archive image' });
  }
});

// Get stats
app.get('/api/stats', async (req, res) => {
  try {
    await ensureArchivesDir();

    const imageFiles = await readdir(IMAGES_DIR);
    const archiveFiles = await readdir(ARCHIVES_DIR);

    const remaining = imageFiles.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).length;
    const archived = archiveFiles.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).length;

    res.json({ remaining, archived });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

app.listen(PORT, () => {
  console.log(`Image Swiper running at http://localhost:${PORT}`);
});
