const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Path Setup
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'shipments.json');

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Database Helpers
function readDB() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
    if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
    try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } 
    catch (error) { return []; }
}
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// 1. Auth Endpoint (Matches Vercel /api/auth)
app.post('/api/auth', (req, res) => {
    const { key } = req.body;
    if (key === 'admin123') {
        res.json({ success: true, token: 'ah-session-' + Date.now() });
    } else {
        res.status(401).json({ success: false, message: "Invalid Access Key" });
    }
});

// 2. Shipments Endpoint (Matches Vercel /api/shipments)
app.get('/api/shipments', (req, res) => {
    const id = req.query.id;
    const db = readDB();
    if (id) {
        const shipment = db.find(s => s.id === id);
        if (shipment) return res.json(shipment);
        return res.status(404).json({ error: 'Not Found' });
    }
    res.json(db);
});
app.post('/api/shipments', (req, res) => {
    try {
        writeDB(req.body);
        const count = Array.isArray(req.body) ? req.body.length : 1;
        console.log(`[${new Date().toLocaleTimeString()}] Saved ${count} shipment(s) to ledger`);
        res.json({ success: true, count });
    } catch (err) {
        console.error("Failed to write shipments to DB:", err);
        res.status(500).json({ error: "Failed to persist shipments" });
    }
});

// 3. Chat Endpoint (Matches Vercel /api/chat)
let chats = {};
app.get('/api/chat', (req, res) => {
    res.json(chats);
});
app.post('/api/chat', (req, res) => {
    chats = req.body;
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`\n🚀 ALLCARGO LOCAL MOCK SERVER ONLINE`);
    console.log(`This server mimics the Vercel KV and Serverless Functions for local testing.`);
    console.log(`Running on port: ${PORT}`);
    console.log(`-----------------------------------`);
});