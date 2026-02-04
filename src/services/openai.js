const API_URL = 'https://api.openai.com/v1/audio/transcriptions'
const MODEL = 'gpt-4o-mini-transcribe'

export const getApiKey = () => {
  return import.meta.env.VITE_OPENAI_API_KEY || null
}

export const hasApiKey = () => Boolean(getApiKey())

export const transcribeAudio = async (audioBlob) => {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('NO_API_KEY')
  }

  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  formData.append('model', MODEL)
  formData.append('language', 'fr')

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      if (response.status === 401) throw new Error('INVALID_API_KEY')
      if (response.status === 429) throw new Error('RATE_LIMITED')
      throw new Error('TRANSCRIPTION_FAILED')
    }

    const result = await response.json()
    return result.text || ''
  } catch (err) {
    if (err.message === 'INVALID_API_KEY' || err.message === 'RATE_LIMITED' || err.message === 'TRANSCRIPTION_FAILED') {
      throw err
    }
    throw new Error('NETWORK_ERROR')
  }
}
