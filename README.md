# NCroft WhatsApp Bot

A powerful WhatsApp bot with AI capabilities and YouTube download features.

## Features

- 🤖 **AI Chat**: Powered by Google Gemini AI for intelligent conversations
- 🎵 **YouTube Audio Download**: Download YouTube videos as MP3 audio files
- 🎬 **YouTube Video Download**: Download YouTube videos in MP4 format
- 🔍 **YouTube Search**: Search for videos directly from WhatsApp

## Prerequisites

- Node.js (v14 or higher)
- WhatsApp account

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables in a `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the bot:
```bash
npm start
```

5. Scan the QR code with your WhatsApp

## Commands

### YouTube Features
- `!ytsearch <query>` - Search for YouTube videos
  - Example: `!ytsearch Alan Walker Faded`

- `!ytaudio <url>` - Download YouTube video as audio (MP3)
  - Example: `!ytaudio https://www.youtube.com/watch?v=dQw4w9WgXcQ`

- `!ytvideo <url>` - Download YouTube video (MP4)
  - Example: `!ytvideo https://www.youtube.com/watch?v=dQw4w9WgXcQ`

### General Commands
- `hi` - Get a greeting from the bot
- `help` - Show all available commands

### AI Chat
- Simply send any message to chat with the AI!

## Technologies Used

- **@whiskeysockets/baileys** - WhatsApp Web API
- **@google/generative-ai** - Google Gemini AI
- **@vreden/youtube_scraper** - YouTube video/audio scraper
- **api-dylux** - YouTube downloader API
- **yt-search** - YouTube search functionality

## How It Works

The bot uses multiple YouTube packages with fallback support:

1. **Primary Method**: Uses `api-dylux` for fast and reliable downloads
2. **Fallback Method**: If api-dylux fails, it automatically falls back to `@vreden/youtube_scraper`
3. **Search**: Uses `yt-search` to find videos by keywords

This multi-package approach ensures maximum reliability and uptime for YouTube features.

## Notes

- The bot only responds to private messages (not group chats)
- Downloaded files are temporarily stored in the `downloads` folder and deleted after sending
- All YouTube downloads respect copyright and should only be used for personal, legal purposes

## License

ISC
