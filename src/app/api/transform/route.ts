import { NextResponse } from 'next/server'
import { generateShakespeareanRoast, generateMemePrompt, generateMemeImage } from '@/services/ai/openai'
import { generateSong, getMockSongUrl } from '@/services/ai/suno'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MEME_TEMPLATES = [
  // Classic Reaction Memes
  'drake',          // Drake Hotline Bling
  'disaster-girl',  // Disaster Girl
  'doge',           // Doge
  'fine',           // This is Fine
  'success',        // Success Kid
  'rollsafe',       // Roll Safe Think About It
  'spongebob',      // Mocking Spongebob
  'buzz',           // Buzz Lightyear
  'patrick',        // Patrick Star
  'salt-bae',       // Salt Bae
  'thinking',       // Thinking Black Guy
  
  // Emotional/Dramatic Memes
  'sad-pablo',      // Sad Pablo Escobar
  'crying-cat',     // Crying Cat
  'this-is-fine',   // This Is Fine
  'harold',         // Hide the Pain Harold
  'feels',          // Feels Guy
  'sad-keanu',      // Sad Keanu
  'first-world',    // First World Problems
  
  // Sassy/Attitude Memes
  'wonka',          // Condescending Wonka
  'skeptical',      // Skeptical Baby
  'aliens',         // Ancient Aliens Guy
  'pigeon',         // Is This a Pigeon
  'so-hot',         // So Hot Right Now
  'shut-up',        // Shut Up and Take My Money
  
  // Plot Twist Memes
  'uno-reverse',    // Uno Reverse Card
  'they-dont-know', // They Don't Know
  'always-has-been', // Always Has Been
  'wait-its-all',   // Wait It's All...
  'matrix',         // Matrix Morpheus
  'surprised',      // Surprised Pikachu
  
  // Relationship Memes
  'distracted-bf',   // Distracted Boyfriend
  'woman-yelling',   // Woman Yelling at Cat
  'butterfly',       // Is This a Pigeon
  'everywhere',      // X, X Everywhere
  'two-buttons',     // Daily Struggle / Two Buttons
  'girlfriend',      // Distracted Girlfriend
  
  // Motivational/Success Memes
  'stonks',          // Stonks
  'modern',          // Modern Problems
  'outstanding',     // Outstanding Move
  'power',           // Unlimited Power
  
  // Classic Formats
  'change-mind',     // Change My Mind
  'one-does-not',    // One Does Not Simply
  'y-u-no',          // Y U No
  'shut-up-money',   // Shut Up And Take My Money
  'i-dont-always',   // The Most Interesting Man
]

// Helper function to pick template based on text content
function pickTemplate(text: string, previousTemplate?: string): string {
  // Always exclude the previous template when generating a new meme
  const availableTemplates = previousTemplate 
    ? MEME_TEMPLATES.filter(t => t !== previousTemplate)
    : MEME_TEMPLATES;

  const textLower = text.toLowerCase();
  let matchedTemplates: string[] = [];

  // Theme-based selection with emotional analysis
  if (textLower.match(/\b(standards?|deserve|better than|loyalty|bare minimum|prize)\b/)) {
    matchedTemplates = ['skeptical', 'wonka', 'rollsafe', 'spongebob'];
  } else if (textLower.match(/\b(ex|dating|relationship|breakup|broke up|cheated)\b/)) {
    matchedTemplates = ['distracted-bf', 'woman-yelling', 'drake', 'harold'];
  } else if (textLower.match(/\b(better|winning|success|glow up|improved|thriving)\b/)) {
    matchedTemplates = ['success', 'doge', 'uno-reverse', 'rollsafe'];
  } else if (textLower.match(/\b(angry|mad|hate|furious|rage|upset)\b/)) {
    matchedTemplates = ['fine', 'crying-cat', 'woman-yelling', 'spongebob'];
  } else if (textLower.match(/\b(plot twist|turns out|actually|suddenly|realize|realized|meanwhile|playing themselves)\b/)) {
    matchedTemplates = ['always-has-been', 'uno-reverse', 'they-dont-know', 'butterfly'];
  } else if (textLower.match(/\b(sad|miss|heart|lonely|depressed|crying)\b/)) {
    matchedTemplates = ['sad-pablo', 'crying-cat', 'this-is-fine', 'harold'];
  } else if (textLower.match(/\b(karma|revenge|payback|showed them|proved)\b/)) {
    matchedTemplates = ['success', 'uno-reverse', 'rollsafe', 'doge'];
  }

  // Filter out previous template from matched templates
  if (previousTemplate) {
    matchedTemplates = matchedTemplates.filter(t => t !== previousTemplate);
  }

  // If no matches or all filtered out, use random templates (excluding previous)
  if (matchedTemplates.length === 0) {
    matchedTemplates = [...availableTemplates];
  }

  // Ensure we have at least one template
  if (matchedTemplates.length === 0) {
    // Emergency fallback - use guaranteed templates except the previous one
    const guaranteedTemplates = ['drake', 'doge', 'success', 'fine'].filter(t => t !== previousTemplate);
    matchedTemplates = guaranteedTemplates;
  }

  // Shuffle the matched templates
  matchedTemplates = matchedTemplates.sort(() => Math.random() - 0.5);

  // Log template selection for debugging
  console.log('Previous template:', previousTemplate);
  console.log('Available templates:', matchedTemplates.length);
  console.log('Selected template:', matchedTemplates[0]);

  // Return the first template after shuffling
  return matchedTemplates[0];
}

// Helper function to validate meme URL with timeout
async function validateMemeUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased to 5 seconds

    // Skip HEAD request and go straight to GET since memegen.link might not support HEAD
    const response = await fetch(url, { 
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`URL validation failed for ${url} with status ${response.status}`);
      return false;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('image')) {
      console.log(`Invalid content type for ${url}: ${contentType}`);
      return false;
    }

    // Simplified validation - just check if we get any data
    const blob = await response.blob();
    const isValid = blob.size > 0;
    
    if (!isValid) {
      console.log(`Zero-size blob received for ${url}`);
    }
    
    return isValid;

  } catch (error) {
    console.error('Meme validation error for URL:', url, error);
    return false;
  }
}

// Helper function to generate meme URL with improved fallback system
async function generateMemeUrl(template: string, topText: string, bottomText: string): Promise<string> {
  const baseUrl = 'https://api.memegen.link/images';
  const params = '?width=1200&height=1200&font=impact&watermark=none';
  
  // Clean and encode text properly
  const cleanText = (text: string) => {
    return encodeURIComponent(
      text.replace(/[^\w\s!?,.']/g, '') // Keep only word chars, spaces, and basic punctuation
         .trim()
         .replace(/\s+/g, '_')
         .slice(0, 50) // Shorter limit for better reliability
    );
  };

  const cleanTop = cleanText(topText);
  const cleanBottom = cleanText(bottomText);
  
  // Try primary URL
  const primaryUrl = `${baseUrl}/${template}/${cleanTop}/${cleanBottom}.png${params}`;
  console.log('Trying primary URL:', primaryUrl);
  if (await validateMemeUrl(primaryUrl)) {
    return primaryUrl;
  }

  // If primary fails, try with our most reliable templates
  const guaranteedTemplates = ['drake', 'doge', 'success', 'fine'];
  for (const fallbackTemplate of guaranteedTemplates) {
    const fallbackUrl = `${baseUrl}/${fallbackTemplate}/${cleanTop}/${cleanBottom}.png${params}`;
    console.log('Trying fallback URL with template:', fallbackTemplate);
    if (await validateMemeUrl(fallbackUrl)) {
      return fallbackUrl;
    }
  }

  // Last resort - use the simplest possible template with minimal text
  console.log('Using last resort template');
  return `${baseUrl}/drake/${encodeURIComponent('When the meme fails')}/${encodeURIComponent('But we keep going')}.png${params}`;
}

export async function POST(request: Request) {
  try {
    const { text, type, previousTemplate, forceNewTemplate = false } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    switch (type) {
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

      case 'meme':
        try {
          // First, get a meme-worthy prompt from GPT
          const promptResponse = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
              {
                role: "system",
                content: `You are a meme expert who can transform emotional rants and vents into viral-worthy memes.
                Rules for processing vents:
                1. Identify the core emotional theme (anger, sadness, revenge, triumph, etc.)
                2. Extract the most impactful or dramatic part of their story
                3. Create a relatable setup that captures their emotional state
                4. Deliver a powerful punchline that either:
                   - Shows emotional growth/triumph
                   - Delivers karmic justice
                   - Makes light of the situation
                   - Turns the tables on the antagonist
                5. Keep each line under 5-6 words for readability
                6. Use common meme speech patterns
                7. Avoid special characters that might break URLs
                8. Make it both relatable and empowering
                
                Format response as JSON with 'top' and 'bottom' keys.
                Example responses:
                For a breakup vent: {"top": "They said I'd never do better", "bottom": "Watch me level up instead"}
                For an angry vent: {"top": "When they try to bring drama", "bottom": "But I'm too busy succeeding"}
                For a sad vent: {"top": "Missing them hit different", "bottom": "Then I remembered their red flags"}`
              },
              {
                role: "user",
                content: text
              }
            ],
            temperature: 0.9,
            max_tokens: 150,
          })

          let memeText;
          try {
            memeText = JSON.parse(promptResponse.choices[0].message.content)
          } catch (parseError) {
            console.error('JSON Parse error:', parseError)
            throw new Error('Failed to generate meme text')
          }

          // Improved text formatting with better character handling
          const formatText = (text: string) => {
            if (!text) return '_'
            
            // First clean the text while preserving important punctuation
            const cleaned = text
              .replace(/['"]/g, '') // Remove quotes
              .replace(/\b2c\b/gi, 'to') // Replace '2c' with 'to'
              .replace(/\b4\b/g, 'for') // Replace '4' with 'for'
              .replace(/\bu\b/gi, 'you') // Replace 'u' with 'you'
              .replace(/\br\b/gi, 'are') // Replace 'r' with 'are'
              .replace(/\bb4\b/gi, 'before') // Replace 'b4' with 'before'
              .replace(/\bgr8\b/gi, 'great') // Replace 'gr8' with 'great'
              .replace(/\bm8\b/gi, 'mate') // Replace 'm8' with 'mate'
              .replace(/\bl8r\b/gi, 'later') // Replace 'l8r' with 'later'
              .replace(/\bw\//g, 'with') // Replace 'w/' with 'with'
              .replace(/\bn\//g, 'and') // Replace 'n/' with 'and'
              .replace(/[^\w\s!?,.']/g, '') // Keep only word chars, spaces, and basic punctuation
              .trim()
              .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
              .replace(/\s+/g, '_') // Replace spaces with underscores
              .slice(0, 50); // Shorter limit for better reliability

            return encodeURIComponent(cleaned);
          }

          const topText = formatText(memeText.top)
          const bottomText = formatText(memeText.bottom)
          
          // Force a different template when generating a new meme
          const template = pickTemplate(text, previousTemplate)
          console.log('Selected template:', template, 'Previous:', previousTemplate, 'Force new:', forceNewTemplate)

          try {
            // Try to generate meme with selected template
            const memeUrl = await generateMemeUrl(template, topText, bottomText)
            
            // Extract the actual template used from the URL
            const usedTemplate = memeUrl.split('/')[4].split('.')[0] // Get template from URL
            
            // Verify we're not using the same template
            if (usedTemplate === previousTemplate) {
              console.log('Same template detected, trying again with forced different template');
              const newTemplate = pickTemplate(text, usedTemplate);
              const newMemeUrl = await generateMemeUrl(newTemplate, topText, bottomText);
              const finalTemplate = newMemeUrl.split('/')[4].split('.')[0];
              
              console.log('Successfully generated new meme with different template:', finalTemplate);
              return NextResponse.json({ 
                result: newMemeUrl,
                template: finalTemplate
              });
            }
            
            console.log('Successfully generated meme with template:', usedTemplate);
            return NextResponse.json({ 
              result: memeUrl,
              template: usedTemplate
            });
          } catch (error) {
            console.error('Failed to generate meme:', error)
            
            // Emergency fallback with minimal text
            const fallbackUrl = `https://api.memegen.link/images/drake/Trying_My_Best/Stay_Strong.png?width=1200&height=1200&font=impact&watermark=none`
            return NextResponse.json({ 
              result: fallbackUrl,
              template: 'drake'
            })
          }

        } catch (error) {
          console.error('Meme generation error:', error)
          // Only use this if GPT fails to generate text
          const simpleTemplates = ['success', 'doge', 'rollsafe']
          const template = simpleTemplates[Math.floor(Math.random() * simpleTemplates.length)]
          const url = `https://api.memegen.link/images/${template}/Keep_Moving_Forward/Stay_Winning.png?width=1200&height=1200&font=impact&watermark=none`
          
          return NextResponse.json({ 
            result: url,
            template
          })
        }

      case 'song':
        try {
          const songUrl = await generateSong(text)
          return NextResponse.json({ result: songUrl })
        } catch (error) {
          console.error('Song generation error:', error)
          if (!process.env.PIAPI_KEY) {
            return NextResponse.json({ result: getMockSongUrl() })
          }
          throw error
        }

      default:
        return NextResponse.json(
          { error: 'Invalid transformation type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Transform error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 