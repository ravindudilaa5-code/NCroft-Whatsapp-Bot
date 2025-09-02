const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')
const fs = require('fs')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys')

  const sock = makeWASocket({
    auth: state
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
      startBot()
    }
  } else if (connection === 'open') {
    console.log('✅ WhatsApp Connected!')
    // Send a message to a friend when connected
    sendMessageToFriend('94763162359', 'hello dinidu komada  !');
  }
})

sock.ev.on("messages.upsert", async ({ messages }) => {
  const msg = messages[0]
  const sender = msg.key.remoteJid

  if (msg.message?.conversation === "hi") {
    await sock.sendMessage(sender, { text: "👋 Hello! How can I help you?" })
  }
})

// Add this function to send messages to friends
async function sendMessageToFriend(phoneNumber, message) {
  // Special handling for Sri Lankan numbers
  let formattedNumber = phoneNumber;
  
  // If it's a Sri Lankan number (starts with 94)
  if (phoneNumber.startsWith('94')) {
    // Make sure there's no leading zero after country code
    const numberPart = phoneNumber.substring(2);
    if (numberPart.startsWith('0')) {
      formattedNumber = '94' + numberPart.substring(1);
    }
  }
  
  // Add WhatsApp suffix if not present
  formattedNumber = formattedNumber.includes('@s.whatsapp.net') 
    ? formattedNumber 
    : `${formattedNumber}@s.whatsapp.net`;
  
  try {
    await sock.sendMessage(formattedNumber, { text: message });
    console.log(`Message sent to ${formattedNumber}`);
    return true;
  } catch (error) {
    console.error(`Failed to send message: ${error}`);
    return false;
  }
}

// Example usage - uncomment to use
// sendMessageToFriend('12345678901', 'Hey there! This is a test message from my WhatsApp bot.');

}

startBot().catch(console.error)
