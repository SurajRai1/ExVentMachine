import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const audioFile = formData.get('file') as Blob
      
      if (!audioFile) {
        return NextResponse.json(
          { error: 'No audio file provided' },
          { status: 400 }
        )
      }

      try {
        const transcription = await openai.audio.transcriptions.create({
          file: audioFile,
          model: 'whisper-1',
        })

        return NextResponse.json({ result: transcription.text })
      } catch (error) {
        console.error('OpenAI transcription error:', error)
        return NextResponse.json(
          { error: 'Failed to transcribe audio' },
          { status: 500 }
        )
      }
    }

    // Handle JSON requests for other operations
    const { text, operation } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    switch (operation) {
      case 'shakespeare':
        const shakeResponse = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: "You are a witty Shakespearean insult generator. Transform modern complaints into elegant Shakespearean roasts."
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.8,
          max_tokens: 200,
        })

        return NextResponse.json({ result: shakeResponse.choices[0].message.content })

      case 'meme-prompt':
        const promptResponse = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: "Create a funny, meme-worthy image prompt based on the user's rant. The prompt should be suitable for DALL-E 3."
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.8,
          max_tokens: 100,
        })

        return NextResponse.json({ result: promptResponse.choices[0].message.content })

      case 'meme-image':
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: text,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        })

        return NextResponse.json({ result: imageResponse.data[0].url })

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 