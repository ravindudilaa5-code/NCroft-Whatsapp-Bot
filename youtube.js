const yts = require('yt-search');
const ytScraper = require('@vreden/youtube_scraper');
const dylux = require('api-dylux');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function downloadYouTube(url, type = 'audio') {
  try {
    // Create downloads folder if it doesn't exist
    const downloadsDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    console.log(`🔍 Processing ${type} download for: ${url}`);

    if (type === 'audio') {
      // Use api-dylux for audio
      try {
        const data = await dylux.ytmp3(url);
        
        if (!data || !data.download) {
          throw new Error('Failed to get download link');
        }

        const title = (data.title || 'audio').replace(/[^a-zA-Z0-9\s]/g, '_').substring(0, 50);
        const fileName = `${title}.mp3`;
        const filePath = path.join(downloadsDir, fileName);

        // Download the file - api-dylux returns download as a string
        const downloadUrl = typeof data.download === 'string' ? data.download : data.download.url;
        
        const response = await axios({
          method: 'get',
          url: downloadUrl,
          responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
          writer.on('finish', () => {
            resolve({ 
              path: filePath, 
              title: data.title || data.metadata?.title || 'Audio'
            });
          });
          writer.on('error', reject);
        });

      } catch (error) {
        console.error('api-dylux failed, trying youtube_scraper:', error.message);
        
        // Fallback to youtube_scraper
        const data = await ytScraper.ytmp3(url);
        
        if (!data || !data.download) {
          throw new Error('Failed to get audio download link');
        }

        const title = (data.metadata?.title || 'audio').replace(/[^a-zA-Z0-9\s]/g, '_').substring(0, 50);
        const fileName = `${title}.mp3`;
        const filePath = path.join(downloadsDir, fileName);

        // youtube_scraper returns download as an object with url property
        const downloadUrl = typeof data.download === 'string' ? data.download : data.download.url;
        
        const response = await axios({
          method: 'get',
          url: downloadUrl,
          responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
          writer.on('finish', () => {
            resolve({ 
              path: filePath, 
              title: data.metadata?.title || 'Audio'
            });
          });
          writer.on('error', reject);
        });
      }
      
    } else if (type === 'video') {
      // Use api-dylux for video
      try {
        const data = await dylux.ytmp4(url);
        
        if (!data || !data.download) {
          throw new Error('Failed to get download link');
        }

        const title = (data.title || 'video').replace(/[^a-zA-Z0-9\s]/g, '_').substring(0, 50);
        const fileName = `${title}.mp4`;
        const filePath = path.join(downloadsDir, fileName);

        // Download the file - api-dylux returns download as a string
        const downloadUrl = typeof data.download === 'string' ? data.download : data.download.url;
        
        const response = await axios({
          method: 'get',
          url: downloadUrl,
          responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
          writer.on('finish', () => {
            resolve({ 
              path: filePath, 
              title: data.title || data.metadata?.title || 'Video'
            });
          });
          writer.on('error', reject);
        });

      } catch (error) {
        console.error('api-dylux failed, trying youtube_scraper:', error.message);
        
        // Fallback to youtube_scraper
        const data = await ytScraper.ytmp4(url);
        
        if (!data || !data.download) {
          throw new Error('Failed to get video download link');
        }

        const title = (data.metadata?.title || 'video').replace(/[^a-zA-Z0-9\s]/g, '_').substring(0, 50);
        const fileName = `${title}.mp4`;
        const filePath = path.join(downloadsDir, fileName);

        // youtube_scraper returns download as an object with url property
        const downloadUrl = typeof data.download === 'string' ? data.download : data.download.url;
        
        const response = await axios({
          method: 'get',
          url: downloadUrl,
          responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
          writer.on('finish', () => {
            resolve({ 
              path: filePath, 
              title: data.metadata?.title || 'Video'
            });
          });
          writer.on('error', reject);
        });
      }
    }
    
  } catch (error) {
    console.error('YouTube download error:', error);
    throw error;
  }
}

// Helper function to search YouTube videos
async function searchYouTube(query) {
  try {
    const results = await yts(query);
    return results.videos.slice(0, 5); // Return top 5 results
  } catch (error) {
    console.error('YouTube search error:', error);
    throw error;
  }
}

module.exports = downloadYouTube;
module.exports.searchYouTube = searchYouTube;
