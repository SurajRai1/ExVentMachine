'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

interface AngryTextProps {
  text: string
  className?: string
}

const angryWords = [
  'hate', 'angry', 'mad', 'furious', 'rage',
  'cheater', 'liar', 'betrayed', 'ghosted', 'blocked',
  'ex', 'breakup', 'dumped', 'heartbreak', 'toxic',
]

export function AngryText({ text, className }: AngryTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const elements = containerRef.current.querySelectorAll('.angry-word')
    elements.forEach((element) => {
      gsap.to(element, {
        keyframes: [
          { scale: 1.1, color: '#FF69B4', duration: 0.2 },
          { scale: 1, color: '#8A2BE2', duration: 0.2 },
        ],
      })
    })
  }, [text])

  const highlightAngryWords = (text: string) => {
    return text.split(/\b/).map((word, index) => {
      const isAngry = angryWords.some(angry => 
        word.toLowerCase().includes(angry.toLowerCase())
      )

      return isAngry ? (
        <span key={index} className="angry-word font-semibold">
          {word}
        </span>
      ) : word
    })
  }

  return (
    <div 
      ref={containerRef}
      className={cn('whitespace-pre-wrap', className)}
    >
      {highlightAngryWords(text)}
    </div>
  )
} 