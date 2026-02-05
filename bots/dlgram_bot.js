// https://github.com/telegraf/telegraf/issues/1889
// https://github.com/feathers-studio/telegraf-docs/blob/master/examples/webhook/koa.ts
// https://github.com/telegraf/telegraf/issues/660 - ngrok sample to test locally

const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const axios = require('axios')

const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')

// https://www.npmjs.com/package/insta-fetcher?activeTab=readme
const { igApi, getCookie } = require("insta-fetcher")
let ig
const INSTA_USER = process.env.INSTA_USER
const INSTA_COOKIE = process.env.INSTA_COOKIE

let dlgramBot

if (process.env.TOKEN_DLGRAM_BOT) {
  ; (async () => {
    const session_id = await getCookie(INSTA_USER, INSTA_COOKIE)
    console.log('insta session id:', session_id)
    ig = new igApi(session_id)
  })()

  dlgramBot = new Telegraf(process.env.TOKEN_DLGRAM_BOT)

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

  const fetchMedia = async (media, ctx) => {
    const file = `post_${media.id}.${media.type === 'video' ? 'mp4' : 'jpg'}`
    const extension = path.extname(file)

    console.log(`downloading ${media.type}: ${media.url}`)

    // Download and save the media file
    const response = await axios.get(media.url, { responseType: 'stream' })
    const writer = fs.createWriteStream(file)

    response.data.pipe(writer)

    writer.on('finish', () => {
      console.log(`Successfully downloaded ${file}`)
      if (IMG_TYPES.includes(extension.toLowerCase())) {
        ctx.reply(`sending photo ${media.id}...`)
        ctx.replyWithPhoto({ source: fs.createReadStream(file) }).then((resolved) => {
          console.log(`deleting sent file ${file} ...`)
          fs.unlinkSync(file)
        })
      } else if (VID_TYPES.includes(extension.toLowerCase())) {
        ctx.reply(`sending video ${media.id}...`)
        ctx.replyWithVideo({ source: fs.createReadStream(file) }).then((resolved) => {
          console.log(`deleting sent file ${file} ...`)
          fs.unlinkSync(file)
        })
      }
    })
  }

  const fetchPost = async (url, ctx) => {
    const post = await ig.fetchPost(url)
    console.log("post:", post)
    ctx.reply(`post by ${post.username} - likes: ${post.likes}/comments: ${post.comment_count}`)

    if (post.media_count < 1) {
      console.log("post contains no media")
      return
    }

    for (let media of post.links) {
      await fetchMedia(media, ctx)
    }
  }

  const fetchStories = async (user, ctx) => {
    const stories = await ig.fetchStories(user)
    ctx.reply(`stories by ${stories.username}: ${stories.stories_count}`)

    if (stories.stories_count < 1) {
      console.log("user contains no stories")
      return
    }

    for (let story of stories.stories) {
      await fetchMedia(story, ctx)
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
      if (!url.toLowerCase().startsWith('http')
        && !url.toLowerCase().startsWith("stories")) {
        return ctx.reply('Please provide a valid URL.')
      }

      let file
      ctx.reply('processing...')
      if (url.indexOf("instagram.com") != -1) {
        console.log(`checking instagram post: ${url}`)
        await fetchPost(url, ctx)
      } else if (url.indexOf("stories") != -1) {
        console.log(`checking instagram: ${url}`)
        await fetchStories(url.split(" ")[1], ctx)
      } else {
        if (!IMG_TYPES.includes(extension.toLowerCase())
          && !VID_TYPES.includes(extension.toLowerCase())) {
          return ctx.reply('Unsupported format. Please send a valid image or video URL.')
        }
        file = await downloadFile(url)
      }
      console.log("prompt processed")

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
} else {
  console.log('TOKEN_DLGRAM_BOT not set, bot initialization skipped')
}

module.exports = {
  dlgramBot
}
