import { useState, useRef, useCallback } from 'react'
import { transcribeAudio, hasApiKey } from '@/services/openai'

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState(null)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = useCallback(async () => {
    if (!hasApiKey()) {
      setError('NO_API_KEY')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Determine best supported audio format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })

      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setError(null)
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('PERMISSION_DENIED')
      } else {
        setError('MICROPHONE_ERROR')
      }
    }
  }, [])

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve('')
        return
      }

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release microphone
        mediaRecorder.stream.getTracks().forEach((track) => track.stop())

        const mimeType = mediaRecorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })

        setIsRecording(false)
        setIsTranscribing(true)

        try {
          const text = await transcribeAudio(blob)
          setIsTranscribing(false)
          resolve(text)
        } catch (err) {
          setIsTranscribing(false)
          setError(err.message)
          resolve('')
        }
      }

      mediaRecorder.stop()
    })
  }, [])

  const cancelRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stream.getTracks().forEach((track) => track.stop())
      mediaRecorder.stop()
    }
    chunksRef.current = []
    setIsRecording(false)
    setIsTranscribing(false)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isRecording,
    isTranscribing,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    clearError,
  }
}
