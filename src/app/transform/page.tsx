'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Lottie from 'lottie-react'
import { ArrowLeft, Share2, Sparkles, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import sassyRaccoon from '../../../public/animations/Sassy-Raccoon-original.json'

interface TransformResult {
  result?: string;
  error?: string;
  template?: string;
}

const loadingMessages = {
  shakespeare: [
    "Summoning Shakespeare's wit...",
    "Crafting elegant insults...",
    "Channeling poetic rage...",
  ],
  meme: [
    "Brewing the perfect meme...",
    "Adding extra sass...",
    "Making it viral-worthy...",
  ],
  song: [
    "Composing your heartbreak...",
    "Adding dramatic flair...",
    "Finding the perfect beat...",
  ],
};

function TransformContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<TransformResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [previousTemplate, setPreviousTemplate] = useState<string | null>(null);

  const text = searchParams.get('text');
  const type = searchParams.get('type') as keyof typeof loadingMessages;

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => 
          (prev + 1) % (loadingMessages[type]?.length || 1)
        );
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoading, type]);

  async function transform(skipPrevious: boolean = false) {
    if (!text || !type) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text, 
          type,
          previousTemplate: skipPrevious ? previousTemplate : undefined,
          forceNewTemplate: skipPrevious // Force new template when clicking "New Meme"
        }),
      });

      const data = await response.json();
      setResult(data);
      if (data.template) {
        setPreviousTemplate(data.template);
      }
    } catch (error) {
      setResult({ error: 'Failed to transform your rant' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    transform();
  }, [text, type]);

  const handleNewMeme = () => {
    // Clear the previous result to show loading state
    setResult(null);
    setIsLoading(true);
    
    // Force a new template
    transform(true);
  };

  const handleShare = async () => {
    if (!result?.result) return;

    // Check if native sharing is available
    if (navigator.share) {
      try {
        // For native mobile sharing
        await navigator.share({
          title: 'My Ex-Vent Meme',
          text: 'Check out this meme I generated!',
          url: result.result
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard copy
      try {
        await navigator.clipboard.writeText(result.result);
        // You might want to add a toast notification here
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const handleDownload = async () => {
    if (!result?.result) return;
    
    try {
      // Fetch the image
      const response = await fetch(result.result);
      const blob = await response.blob();
      
      // Create a temporary link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ex-vent-meme-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-6xl sm:text-7xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-[size:200%] animate-gradient bg-clip-text text-transparent">
            {isLoading ? 'Transforming Your Rant...' : "Here's Your Result!"}
          </span>
        </h1>
      </div>

      <div className="flex flex-col items-center gap-16">
        <div className="relative w-64 h-64 transition-all duration-500 hover:scale-110">
          <Lottie 
            animationData={sassyRaccoon}
            loop={true}
            style={{ 
              filter: isLoading ? 'hue-rotate(90deg)' : result?.error ? 'hue-rotate(180deg)' : 'none',
              transform: isLoading ? 'scale(0.95)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}
          />
        </div>

        {isLoading ? (
          <Loading 
            text={loadingMessages[type]?.[loadingMessageIndex] || 'Processing...'}
          />
        ) : result?.error ? (
          <div className="text-center space-y-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-red-500/20 rounded-xl blur opacity-75" />
              <div className="relative p-8 rounded-xl bg-black/60 backdrop-blur-xl border border-red-500/20">
                <p className="text-red-400 text-xl">{result.error}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => transform()}
              className="group relative overflow-hidden text-lg py-6 px-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-20 animate-gradient bg-[size:200%]" />
              <ArrowLeft className="w-5 h-5 mr-3" />
              Try Again
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-3xl space-y-10">
            {type === 'meme' ? (
              <div className="relative">
                <div className="w-full max-w-2xl mx-auto">
                  <img 
                    src={result?.result} 
                    alt="Generated meme"
                    className="w-full h-full object-contain rounded-xl" 
                  />
                </div>
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-xl blur opacity-30 group-hover:opacity-60 animate-gradient bg-[size:200%] transition duration-1000" />
                <div className="relative p-8 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10">
                  <p className="text-2xl text-gray-200 whitespace-pre-wrap leading-relaxed">{result?.result}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full max-w-xl mx-auto">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.history.back()}
                className="group relative overflow-hidden text-base font-medium py-4 px-6 min-w-[140px] border-2 border-white/10 hover:border-primary/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Back
              </Button>
              {type === 'meme' && (
                <>
                  <Button 
                    variant="secondary"
                    size="lg"
                    onClick={handleNewMeme}
                    className="group relative overflow-hidden text-base font-medium py-4 px-6 min-w-[140px] bg-secondary/90 hover:bg-secondary transition-all duration-300 shadow-lg shadow-secondary/20 hover:shadow-secondary/40"
                  >
                    <Sparkles className="w-4 h-4 mr-2 transition-transform group-hover:rotate-12" />
                    New Meme
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={handleDownload}
                    className="group relative overflow-hidden text-base font-medium py-4 px-6 min-w-[140px] border-2 border-secondary/50 hover:border-secondary text-secondary hover:text-secondary transition-all duration-300"
                  >
                    <Download className="w-4 h-4 mr-2 transition-transform group-hover:-translate-y-1" />
                    Download
                  </Button>
                  <Button 
                    size="lg"
                    onClick={handleShare}
                    className="group relative overflow-hidden text-base font-medium py-4 px-6 min-w-[140px] bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Share2 className="w-4 h-4 mr-2 transition-transform group-hover:rotate-12" />
                    Share
                  </Button>
                </>
              )}
              {type !== 'meme' && (
                <Button 
                  size="lg"
                  onClick={handleShare}
                  className="group relative overflow-hidden text-base font-medium py-4 px-6 min-w-[140px] bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Share2 className="w-4 h-4 mr-2 transition-transform group-hover:rotate-12" />
                  Share Result
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TransformPage() {
  return (
    <main className="min-h-screen bg-[#13111C] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#8A2BE2_0%,_transparent_50%)] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_#FF69B4_0%,_transparent_35%)] opacity-20" />
      <TransformContent />
    </main>
  );
}