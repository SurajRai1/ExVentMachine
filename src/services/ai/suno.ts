const PIAPI_BASE_URL = 'https://piapi.ai/api/v1'

interface SunoTaskResponse {
  code: number
  data: {
    task_id: string
    status: 'completed' | 'processing' | 'pending' | 'failed' | 'staged'
    output?: {
      clips?: {
        [key: string]: {
          audio_url?: string
          status?: string
          error_message?: string
        }
      }
    }
    error?: {
      message?: string
    }
  }
  message: string
}

export async function generateSong(text: string) {
  try {
    // 1. Create song generation task
    const createResponse = await fetch(`${PIAPI_BASE_URL}/suno/generate`, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.PIAPI_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: text,
        duration: 30, // 30 seconds song
      }),
    })

    const createData = await createResponse.json()
    if (!createData.data?.task_id) {
      throw new Error('Failed to create song generation task')
    }

    const taskId = createData.data.task_id

    // 2. Poll for task completion
    let attempts = 0
    const maxAttempts = 30 // 30 * 2 seconds = 60 seconds max wait
    let taskResponse: SunoTaskResponse

    while (attempts < maxAttempts) {
      const checkResponse = await fetch(`${PIAPI_BASE_URL}/task/${taskId}`, {
        headers: {
          'x-api-key': process.env.PIAPI_KEY!,
        },
      })

      taskResponse = await checkResponse.json()

      if (taskResponse.data.status === 'completed') {
        // Find the first clip with an audio URL
        const clip = Object.values(taskResponse.data.output?.clips || {}).find(
          (clip) => clip.audio_url
        )
        if (clip?.audio_url) {
          return clip.audio_url
        }
        throw new Error('No audio URL found in completed task')
      }

      if (taskResponse.data.status === 'failed') {
        throw new Error(
          taskResponse.data.error?.message || 'Song generation failed'
        )
      }

      // Wait 2 seconds before next attempt
      await new Promise((resolve) => setTimeout(resolve, 2000))
      attempts++
    }

    throw new Error('Song generation timed out')
  } catch (error) {
    console.error('Song generation error:', error)
    throw error
  }
}

// Mock response for development when API is not available
export function getMockSongUrl() {
  return 'https://example.com/mock-song.mp3'
} 