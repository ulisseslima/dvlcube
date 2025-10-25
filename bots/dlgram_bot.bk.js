// Import required packages
const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
// const { message } = require('telegraf/filters'); //?

let singleton = null

function create() {
  return new Telegraf(process.env.TOKEN_DLGRAM_BOT);
}

exports.dlgramBot = () => {
  if (!singleton) {
    singleton = create()
  }
  return singleton
}

// Function to download a file from the provided URL
const downloadFile = async (url, fileName) => {
  const response = await fetch(url);
  const buffer = await response.buffer();
  fs.writeFileSync(fileName, buffer);
  console.log('File downloaded successfully!');
};

// Handle /start command
dlgramBot().start((ctx) => {
  ctx.reply('Send me a URL of an image or video and I will download and send it back to you.');
});

// Listen for any text message (which should be the URL)
dlgramBot().on('text', async (ctx) => {
  const url = ctx.message.text;

  try {
    // Check if URL is valid (basic check)
    if (!url.startsWith('http')) {
      return ctx.reply('Please provide a valid URL.');
    }

    // Get the file extension from the URL
    const fileExtension = path.extname(url);
    
    // Validate extension (supporting common image/video formats)
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.avi'];
    if (!validExtensions.includes(fileExtension.toLowerCase())) {
      return ctx.reply('Unsupported file format. Please send a valid image or video URL.');
    }

    // Define file name to save
    const fileName = `downloaded_file${fileExtension}`;

    // Download the file
    await downloadFile(url, fileName);

    // Send the file back to the user
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension.toLowerCase())) {
      await ctx.replyWithPhoto({ source: fs.createReadStream(fileName) });
    } else if (['.mp4', '.mov', '.avi'].includes(fileExtension.toLowerCase())) {
      await ctx.replyWithVideo({ source: fs.createReadStream(fileName) });
    }

    // Delete the file after sending
    fs.unlinkSync(fileName);
  } catch (error) {
    console.error('Error handling URL:', error);
    ctx.reply('Failed to download or send the file. Please try again.');
  }
});

// Start the bot
// dlgramBot.launch();
// console.log('Bot is running...');