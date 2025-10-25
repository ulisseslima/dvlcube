// https://github.com/telegraf/telegraf/issues/1889
// https://github.com/feathers-studio/telegraf-docs/blob/master/examples/webhook/koa.ts
// https://github.com/telegraf/telegraf/issues/660 - ngrok sample to test locally

const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
const ig = require('instagram-scraping')

const dlgramBot = new Telegraf(process.env.TOKEN_DLGRAM_BOT)

const IMG_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.tif', '.tiff']
const VID_TYPES = ['.mp4', '.mov', '.webm']
const WEB_TYPES = ['instagram.com', 'x.com']

// Function to download a file from the provided URL
const downloadFile = async (url) => {
  // Get the file extension from the URL
  const extension = path.extname(url)
    
  // Define file name to save
  const file = `downloaded${extension}`

  const response = await fetch(url)
  const buffer = await response.buffer()
  
  fs.writeFileSync(fileName, buffer)
  console.log('File downloaded successfully!')

  return file
}

const downloadInstagramPost = async (url, ctx) => {
  try {
    const postData = await ig.scrapePost(url)

    if (!postData?.media?.length > 0) {
      console.log('No media found for the given URL')
      ctx.reply('No media found for the given URL')
      return
    }

    for (let i = 0; i < postData.media.length; i++) {
      const mediaUrl = postData.media[i]
      const mediaType = mediaUrl.includes('.mp4') ? 'video' : 'image'
      const file = `downloaded_${i}.${mediaType === 'image' ? 'jpg' : 'mp4'}`
      const extension = path.extname(file)

      console.log(`Downloading ${mediaType}: ${mediaUrl}`)

      // Download and save the media file
      const response = await axios.get(mediaUrl, { responseType: 'stream' })
      const writer = fs.createWriteStream(file)

      response.data.pipe(writer)

      writer.on('finish', () => {
        console.log(`Successfully downloaded ${file}`)
        if (IMG_TYPES.includes(extension.toLowerCase())) {
          ctx.reply('sending photo...')
          ctx.replyWithPhoto({ source: fs.createReadStream(file) }).then((resolved) => {
            console.log(`deleting sent file ${file} ...`)
            fs.unlinkSync(file)
          })
        } else if (VID_TYPES.includes(extension.toLowerCase())) {
          ctx.reply('sending video...')
          ctx.replyWithVideo({ source: fs.createReadStream(file) }).then((resolved) => {
            console.log(`deleting sent file ${file} ...`)
            fs.unlinkSync(file)
          })
        }
      })
    }
  } catch (error) {
    console.error('Error downloading media:', error)
  }
}

// Handle /start command
dlgramBot.start((ctx) => {
  ctx.reply('Send me a URL of an image or video and I will download and send it back to you.')
})

// Listen for any text message (which should be the URL)
dlgramBot.on(message('text'), async (ctx) => {
  const url = ctx.message.text
  const extension = path.extname(url)

  try {
    // Check if URL is valid (basic check)
    if (!url.startsWith('http')) {
      return ctx.reply('Please provide a valid URL.')
    }

    let file
    ctx.reply('processing...')
    if (url.indexOf("instagram.com") != -1) {
      console.log(`checking instagram post: ${url}`)
      await downloadInstagramPost(url, ctx)
      ctx.reply('post scraped')
    } else {
      if (!IMG_TYPES.includes(extension.toLowerCase()) 
        && !VID_TYPES.includes(extension.toLowerCase())) {
        return ctx.reply('Unsupported format. Please send a valid image or video URL.')
      }
      file = await downloadFile(url)
    }

    if (file) {
      let extension = path.extname(file)
      // Send the file back to the user
      if (IMG_TYPES.includes(extension.toLowerCase())) {
        ctx.reply('sending photo...')
        await ctx.replyWithPhoto({ source: fs.createReadStream(file) })
      } else if (VID_TYPES.includes(extension.toLowerCase())) {
        ctx.reply('sending video...')
        await ctx.replyWithVideo({ source: fs.createReadStream(file) })
      }
    }

  } catch (error) {
    console.error('Error handling URL:', error)
    ctx.reply('Failed to download or send the file. Please try again.')
  }
})

// Start the bot
// dlgramBot.launch()
// console.log('Bot is running...')

module.exports = {
  dlgramBot
}