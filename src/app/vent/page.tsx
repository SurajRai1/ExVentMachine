'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Lottie from 'lottie-react'
import { Mic, Wand2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AngryText } from '@/components/ui/angry-text'
import { useAudioRecording } from '@/hooks/useAudioRecording'
import { transcribeAudio } from '@/services/ai/openai'
import sassyRaccoon from '../../../public/animations/Sassy-Raccoon-original.json'

const transformTypes = [
  { 
    id: 'shakespeare', 
    emoji: '🎭', 
    label: 'Shakespeare', 
    description: 'Turn your rant into elegant Old English',
    gradient: 'from-purple-600 to-indigo-600'
  },
  { 
    id: 'meme', 
    emoji: '😂', 
    label: 'Meme', 
    description: 'Create a viral-worthy meme',
    gradient: 'from-pink-600 to-rose-600'
  },
  { 
    id: 'song', 
    emoji: '🎵', 
    label: 'Song', 
    description: 'Transform your words into melody',
    gradient: 'from-cyan-600 to-blue-600'
  },
] as const

export default function VentPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [volume, setVolume] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [selectedType, setSelectedType] = useState<typeof transformTypes[number]['id']>('shakespeare')
  const [showPreview, setShowPreview] = useState(false)
  
  const { isRecording, audioUrl, audioBlob, startRecording, stopRecording } = useAudioRecording({
    onVolumeChange: setVolume,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text.length > 0) {
        setShowPreview(true)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [text])

  async function handleTransform() {
    if (!text && !audioBlob) return

    let finalText = text
    if (audioBlob) {
      setIsTranscribing(true)
      try {
        const transcription = await transcribeAudio(audioBlob)
        finalText = transcription
        setText(transcription)
      } catch (error) {
        console.error('Transcription error:', error)
        return
      } finally {
        setIsTranscribing(false)
      }
    }

    const params = new URLSearchParams({
      text: finalText,
      type: selectedType,
    })
    router.push(`/transform?${params.toString()}`)
  }

  return (
    <main className="min-h-screen bg-[#13111C] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#8A2BE2_0%,_transparent_50%)] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_#FF69B4_0%,_transparent_35%)] opacity-20" />
      
      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-[size:200%] animate-gradient bg-clip-text text-transparent">
              Let It All Out
            </span>
          </h1>
          <p className="text-xl text-gray-400/80">
            Rant-Rex is listening. Tell them what's on your mind...
          </p>
        </div>

        <div className="flex flex-col items-center gap-16">
          <div className="relative w-64 h-64 transition-all duration-500 hover:scale-110">
            <Lottie 
              animationData={sassyRaccoon}
              loop={true}
              style={{ 
                filter: isRecording ? 'hue-rotate(90deg)' : 'none',
                transform: isTranscribing ? 'scale(0.95)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            />
          </div>

          <div className="w-full max-w-3xl space-y-10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-xl blur opacity-30 group-hover:opacity-60 animate-gradient bg-[size:200%] transition duration-1000" />
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value)
                    setShowPreview(false)
                  }}
                  className="w-full h-48 p-6 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/50 resize-none text-lg placeholder:text-gray-500 transition-all"
                  placeholder="Type your rant here... or use the microphone below"
                />
                {showPreview && text && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-xl p-6 rounded-xl border border-primary/20 overflow-auto transition-all">
                    <AngryText text={text} className="text-lg" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {transformTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`group relative p-8 rounded-xl border transition-all duration-500 ${
                    selectedType === type.id 
                      ? 'bg-black/60 border-primary/50 text-white scale-105 shadow-xl shadow-primary/20' 
                      : 'bg-black/40 border-white/5 text-gray-400 hover:scale-[1.02] hover:bg-black/50 hover:border-white/20'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <div className="relative flex flex-col items-center gap-3 text-center">
                    <span className="text-4xl transform group-hover:scale-110 transition-transform">{type.emoji}</span>
                    <span className="font-semibold text-lg">{type.label}</span>
                    <span className="text-sm opacity-75">{type.description}</span>
                  </div>
                  {selectedType === type.id && (
                    <Sparkles className="absolute top-3 right-3 w-5 h-5 text-primary animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button 
                variant={isRecording ? "secondary" : "outline"}
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className="group relative overflow-hidden text-lg py-6 px-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-20 animate-gradient bg-[size:200%]" />
                <Mic className={`w-5 h-5 mr-3 ${isRecording ? 'text-white animate-pulse' : ''}`} />
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              
              <Button 
                size="lg"
                onClick={handleTransform}
                disabled={(!text && !audioBlob) || isTranscribing}
                className="group relative overflow-hidden bg-gradient-to-r from-primary via-secondary to-primary text-white text-lg py-6 px-8 animate-gradient bg-[size:200%] hover:shadow-lg hover:shadow-primary/20 transition-shadow"
              >
                <Wand2 className="w-5 h-5 mr-3" />
                {isTranscribing ? 'Transcribing...' : 'Transform'}
              </Button>
            </div>

            {audioUrl && (
              <div className="flex justify-center mt-4">
                <audio 
                  src={audioUrl} 
                  controls 
                  className="w-full max-w-md rounded-full bg-black/40 backdrop-blur-xl" 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
} 