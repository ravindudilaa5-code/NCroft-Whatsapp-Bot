// Alternative WhatsApp bot using whatsapp-web.js
// Install with: npm install whatsapp-web.js

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('📱 Scan this QR code with your WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp Connected!');
});

client.on('message', async (msg) => {
    console.log(`💬 Message from ${msg.from}: ${msg.body}`);
    
    if (msg.body === '!ping') {
        msg.reply('🏓 Pong!');
    }
});

client.initialize();
