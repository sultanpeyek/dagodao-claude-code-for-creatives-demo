import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(join(__dirname, 'public')));

// Serve lib files for ES module imports
app.use('/lib', express.static(join(__dirname, 'lib')));

// Serve config files
app.use('/config', express.static(join(__dirname, 'config')));

// Serve Three.js from node_modules
app.use('/three', express.static(join(__dirname, 'node_modules/three')));

// Serve output files
app.use('/output', express.static(join(__dirname, 'output')));

// API endpoint to get ship data
app.get('/api/ship/:seed', async (req, res) => {
  try {
    const seed = parseInt(req.params.seed, 10);
    if (isNaN(seed)) {
      return res.status(400).json({ error: 'Invalid seed' });
    }

    // Dynamic import to work with ES modules
    const { generateShipData } = await import('./lib/shipGenerator.js');
    const shipData = generateShipData(seed);

    res.json(shipData);
  } catch (error) {
    console.error('Error generating ship data:', error);
    res.status(500).json({ error: 'Failed to generate ship data' });
  }
});

// API endpoint to get metadata
app.get('/api/metadata/:tokenId', async (req, res) => {
  try {
    const tokenId = parseInt(req.params.tokenId, 10);
    if (isNaN(tokenId)) {
      return res.status(400).json({ error: 'Invalid token ID' });
    }

    const { generateShipData } = await import('./lib/shipGenerator.js');
    const { generateMetadata } = await import('./lib/metadataGenerator.js');

    const shipData = generateShipData(tokenId); // Use tokenId as seed
    const imageUri = `ipfs://YOUR_CID/${tokenId}.png`;
    const metadata = generateMetadata(tokenId, shipData, imageUri);

    res.json(metadata);
  } catch (error) {
    console.error('Error generating metadata:', error);
    res.status(500).json({ error: 'Failed to generate metadata' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Procedural Ship Generator                            ║
║                                                           ║
║   Server running at: http://localhost:${PORT}               ║
║                                                           ║
║   Endpoints:                                              ║
║   • Viewer:     http://localhost:${PORT}                    ║
║   • Ship API:   http://localhost:${PORT}/api/ship/:seed     ║
║   • Metadata:   http://localhost:${PORT}/api/metadata/:id   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
