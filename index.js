const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const askGemini = require('./gemini')
const downloadYouTube = require('./youtube')
const { searchYouTube } = require('./youtube')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    syncFullHistory: false,
    markOnlineOnConnect: true
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
    
    if (qr) {
      console.log('📱 Scan this QR code with your WhatsApp:')
      qrcode.generate(qr, { small: true })
    }
    
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom) 
        ? lastDisconnect?.error?.output?.statusCode !== 401 
        : false
      
      console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect)
      
      if (shouldReconnect) {
        // Add delay before reconnecting to avoid rate limiting
        setTimeout(() => {
          console.log('⏳ Reconnecting in 3 seconds...')
          startBot()
        }, 3000)
      } else {
        console.log('⚠️ Connection permanently closed. Please delete auth_info_baileys folder and restart.')
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp Connected!')
    }
  })

  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msg = messages[0];
      
      if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
      if (msg.key.fromMe) return;
      if (msg.key.remoteJid.endsWith('@g.us')) return;
      
      const sender = msg.key.remoteJid;
      
      let userMessage = '';
      if (msg.message.conversation) {
        userMessage = msg.message.conversation;
      } else if (msg.message.extendedTextMessage) {
        userMessage = msg.message.extendedTextMessage.text;
      } else {
        return;
      }

      console.log(`💬 Message from ${sender}: ${userMessage}`);

      // YouTube search command
      if (userMessage.toLowerCase().startsWith('!ytsearch ')) {
        const query = userMessage.slice(10).trim();
        await sock.sendMessage(sender, { text: "🔍 Searching YouTube..." });
        
        try {
          const results = await searchYouTube(query);
          
          if (results.length === 0) {
            await sock.sendMessage(sender, { text: "❌ No results found." });
            return;
          }
          
          let resultText = `🎥 *Search Results for "${query}":*\n\n`;
          results.forEach((video, index) => {
            resultText += `${index + 1}. *${video.title}*\n`;
            resultText += `   👤 ${video.author.name}\n`;
            resultText += `   ⏱️ ${video.timestamp}\n`;
            resultText += `   🔗 ${video.url}\n\n`;
          });
          
          await sock.sendMessage(sender, { text: resultText });
          console.log(`✅ Sent search results to ${sender}`);
        } catch (error) {
          await sock.sendMessage(sender, { text: "❌ Error searching YouTube." });
        }
        return;
      }

      // YouTube download commands
      if (userMessage.toLowerCase().startsWith('!ytaudio ')) {
        const url = userMessage.slice(9).trim();
        await sock.sendMessage(sender, { text: "⏳ Downloading audio... Please wait." });
        
        try {
          const result = await downloadYouTube(url, 'audio');
          await sock.sendMessage(sender, { 
            audio: { url: result.path },
            mimetype: 'audio/mp4',
            fileName: `${result.title}.mp3`
          });
          
          // Delete file after sending
          fs.unlinkSync(result.path);
          console.log(`✅ Sent audio to ${sender}`);
        } catch (error) {
          await sock.sendMessage(sender, { text: "❌ Error downloading audio. Please check the URL." });
        }
        return;
      }

      if (userMessage.toLowerCase().startsWith('!ytvideo ')) {
        const url = userMessage.slice(9).trim();
        await sock.sendMessage(sender, { text: "⏳ Downloading video... Please wait." });
        
        try {
          const result = await downloadYouTube(url, 'video');
          await sock.sendMessage(sender, { 
            video: { url: result.path },
            caption: `🎬 ${result.title}`,
            fileName: `${result.title}.mp4`
          });
          
          // Delete file after sending
          fs.unlinkSync(result.path);
          console.log(`✅ Sent video to ${sender}`);
        } catch (error) {
          await sock.sendMessage(sender, { text: "❌ Error downloading video. Please check the URL." });
        }
        return;
      }

      // Simple command handling
      if (userMessage.toLowerCase() === "hi") {
        await sock.sendMessage(sender, { text: "👋 Hello! How can I help you?" });
        return;
      }

      if (userMessage.toLowerCase() === "help") {
        const helpText = `🤖 *Bot Commands:*\n\n` +
          `• !ytsearch <query> - Search YouTube videos\n` +
          `• !ytaudio <url> - Download YouTube audio\n` +
          `• !ytvideo <url> - Download YouTube video\n` +
          `• hi - Say hello\n` +
          `• help - Show this message\n\n` +
          `Or just ask me anything!`;
        await sock.sendMessage(sender, { text: helpText });
        return;
      }

      // Get AI reply from Gemini
      const aiReply = await askGemini(userMessage);
      await sock.sendMessage(sender, { text: aiReply });
      console.log(`🤖 Replied to ${sender} with AI response`);
      
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });
}

startBot().catch(console.error)
