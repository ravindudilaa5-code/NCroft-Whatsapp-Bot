const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');

async function downloadYouTube(url, type = 'audio') {
  try {
    // Validate URL
    if (!ytdl.validateURL(url)) {
      throw new Error('Invalid YouTube URL');
    }

    // Get video info
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9\s]/g, '_').substring(0, 50);
    
    // Create downloads folder if it doesn't exist
    const downloadsDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }
    
    if (type === 'audio') {
      // Download audio only
      const fileName = `${title}.mp3`;
      const filePath = path.join(downloadsDir, fileName);
      
      return new Promise((resolve, reject) => {
        const stream = ytdl(url, {
          quality: 'highestaudio',
          filter: 'audioonly'
        });
        
        const writeStream = fs.createWriteStream(filePath);
        
        stream.pipe(writeStream);
        
        writeStream.on('finish', () => {
          resolve({ 
            path: filePath, 
            title: info.videoDetails.title
          });
        });
        
        writeStream.on('error', reject);
        stream.on('error', reject);
      });
      
    } else if (type === 'video') {
      // Download video with audio
      const fileName = `${title}.mp4`;
      const filePath = path.join(downloadsDir, fileName);
      
      return new Promise((resolve, reject) => {
        const stream = ytdl(url, {
          quality: 'highestvideo',
          filter: format => format.container === 'mp4' && format.hasVideo && format.hasAudio
        });
        
        const writeStream = fs.createWriteStream(filePath);
        
        stream.pipe(writeStream);
        
        writeStream.on('finish', () => {
          resolve({ 
            path: filePath, 
            title: info.videoDetails.title
          });
        });
        
        writeStream.on('error', reject);
        stream.on('error', reject);
      });
    }
    
  } catch (error) {
    console.error('YouTube download error:', error);
    throw error;
  }
}

module.exports = downloadYouTube;