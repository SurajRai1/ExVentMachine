'use client'

import { useRouter } from 'next/navigation'
import Lottie from 'lottie-react'
import sassyRaccoon from '../../public/animations/Sassy-Raccoon-original.json'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#13111C] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#8A2BE2_0%,_transparent_50%)] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_#FF69B4_0%,_transparent_35%)] opacity-20" />
      
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="max-w-5xl w-full space-y-12 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Turn Your Breakup Rant Into Art
          </h1>
          
          <p className="text-xl text-gray-400/80 max-w-2xl mx-auto">
            Let our sassy AI raccoon transform your heartbreak into a bop, 
            a meme, or a Shakespearean tragedy.
          </p>

          <div className="relative w-64 h-64 mx-auto">
            <Lottie 
              animationData={sassyRaccoon}
              loop={true}
              className="transition-all duration-500 hover:scale-110"
            />
          </div>

          <div className="space-y-4 relative z-10">
            <a 
              href="/vent"
              className="inline-block px-8 py-4 text-lg font-medium text-white rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all cursor-pointer relative z-10"
            >
              Start Venting →
            </a>
            
            <p className="text-sm text-gray-400/80">
              100% Free • No Sign-up Required
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left max-w-3xl mx-auto">
            <div className="space-y-2">
              <h3 className="font-semibold text-white">🎵 Breakup Songs</h3>
              <p className="text-sm text-gray-400/80">
                Turn your rant into a catchy tune in any genre
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-white">🎭 Shakespeare Mode</h3>
              <p className="text-sm text-gray-400/80">
                Get your revenge in elegant Old English
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-white">😂 Meme Generator</h3>
              <p className="text-sm text-gray-400/80">
                Create shareable memes from your story
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
