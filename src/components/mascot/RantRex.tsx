'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

// We'll need to add actual animation JSON files later
const animations = {
  idle: '/animations/rant-rex-idle.json',
  listening: '/animations/rant-rex-listening.json',
  generating: '/animations/rant-rex-generating.json',
  error: '/animations/rant-rex-error.json',
}

type RantRexState = 'idle' | 'listening' | 'generating' | 'error'

interface RantRexProps {
  state?: RantRexState
  className?: string
  volume?: number // For microphone input reaction
}

export function RantRex({ state = 'idle', className, volume = 0 }: RantRexProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const bodyRef = useRef<SVGPathElement>(null)
  const earsRef = useRef<SVGGElement>(null)
  const eyesRef = useRef<SVGGElement>(null)
  const tailRef = useRef<SVGPathElement>(null)

  // Initialize animations
  useEffect(() => {
    if (!svgRef.current) return

    // Reset any ongoing animations
    gsap.killTweensOf([bodyRef.current, earsRef.current, eyesRef.current, tailRef.current])

    switch (state) {
      case 'idle':
        // Gentle breathing animation
        gsap.to(bodyRef.current, {
          scaleY: 1.05,
          yoyo: true,
          repeat: -1,
          duration: 2,
          ease: "power1.inOut"
        })
        // Subtle tail wag
        gsap.to(tailRef.current, {
          rotation: 5,
          transformOrigin: "top",
          yoyo: true,
          repeat: -1,
          duration: 1.5,
          ease: "power1.inOut"
        })
        break

      case 'listening':
        // Ear twitching based on volume
        gsap.to(earsRef.current, {
          scaleY: 1 + (volume / 200),
          duration: 0.1,
        })
        // Alert pose
        gsap.to(bodyRef.current, {
          scaleY: 1.1,
          duration: 0.3,
        })
        break

      case 'generating':
        // Excited bouncing
        gsap.to(svgRef.current, {
          y: -10,
          yoyo: true,
          repeat: -1,
          duration: 0.5,
          ease: "power1.inOut"
        })
        // Tail wagging
        gsap.to(tailRef.current, {
          rotation: 15,
          transformOrigin: "top",
          yoyo: true,
          repeat: -1,
          duration: 0.5,
          ease: "power1.inOut"
        })
        break

      case 'error':
        // Shake head
        gsap.to(svgRef.current, {
          x: 5,
          yoyo: true,
          repeat: 3,
          duration: 0.1,
          ease: "power1.inOut"
        })
        // Flatten ears
        gsap.to(earsRef.current, {
          scaleY: 0.7,
          duration: 0.2,
        })
        break
    }
  }, [state, volume])

  return (
    <div className={cn('relative w-64 h-64', className)}>
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className="w-full h-full"
      >
        {/* Body */}
        <path
          ref={bodyRef}
          d="M100,180 C150,180 190,140 190,90 C190,40 150,20 100,20 C50,20 10,40 10,90 C10,140 50,180 100,180 Z"
          fill="#8A2BE2"
          className="drop-shadow-lg"
        />

        {/* Ears */}
        <g ref={earsRef}>
          <path
            d="M40,60 L30,20 L50,40 Z"
            fill="#8A2BE2"
            className="drop-shadow-md"
          />
          <path
            d="M160,60 L170,20 L150,40 Z"
            fill="#8A2BE2"
            className="drop-shadow-md"
          />
        </g>

        {/* Eyes */}
        <g ref={eyesRef}>
          <circle cx="70" cy="80" r="10" fill="white" />
          <circle cx="130" cy="80" r="10" fill="white" />
          <circle cx="70" cy="80" r="5" fill="black" />
          <circle cx="130" cy="80" r="5" fill="black" />
        </g>

        {/* Nose */}
        <path
          d="M95,100 Q100,105 105,100 Q100,110 95,100 Z"
          fill="black"
        />

        {/* Tail */}
        <path
          ref={tailRef}
          d="M180,120 Q200,100 190,80 Q180,60 160,90"
          fill="none"
          stroke="#8A2BE2"
          strokeWidth="10"
          className="drop-shadow-md"
        />
      </svg>
    </div>
  )
} 