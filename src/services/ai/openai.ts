// Mock responses for development
const MOCK_RESPONSES = {
  shakespeare: [
    "Thou art a boil, a plague sore, an embossed carbuncle in my corrupted blood!",
    "Thine face is not worth sunburning, thou saucy beetle-headed flap-dragon!",
    "Away, you three-inch fool! Thou art a most notable coward!",
  ],
  meme: [
    "https://placekitten.com/800/800",
    "https://placekitten.com/801/801",
    "https://placekitten.com/802/802",
  ],
}

export async function generateShakespeareanRoast(text: string) {
  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        operation: 'shakespeare',
      }),
    })

    const data = await response.json()
    if (data.error) throw new Error(data.error)
    return data.result
  } catch (error) {
    console.error('Shakespeare generation error:', error)
    // Return mock response in development
    return MOCK_RESPONSES.shakespeare[Math.floor(Math.random() * MOCK_RESPONSES.shakespeare.length)]
  }
}

export async function generateMemePrompt(text: string) {
  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        operation: 'meme-prompt',
      }),
    })

    const data = await response.json()
    if (data.error) throw new Error(data.error)
    return data.result
  } catch (error) {
    console.error('Meme prompt generation error:', error)
    return "A funny cat looking disappointed"
  }
}

export async function generateMemeImage(prompt: string) {
  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: prompt,
        operation: 'meme-image',
      }),
    })

    const data = await response.json()
    if (data.error) throw new Error(data.error)
    return data.result
  } catch (error) {
    console.error('Meme image generation error:', error)
    return MOCK_RESPONSES.meme[Math.floor(Math.random() * MOCK_RESPONSES.meme.length)]
  }
}

export async function transcribeAudio(audioBlob: Blob) {
  try {
    // Create a FormData instance and append the audio file
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')

    const response = await fetch('/api/openai', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    if (data.error) throw new Error(data.error)
    return data.result
  } catch (error) {
    console.error('Audio transcription error:', error)
    return "This is a mock transcription of your audio rant. In development mode, we don't actually process the audio."
  }
} 