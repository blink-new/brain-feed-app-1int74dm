import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface VideoRequest {
  url: string;
  videoId: string;
  topic: string;
}

interface Question {
  questionType: 'mcq' | 'true_false' | 'match_pairs' | 'arrange_steps';
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Flashcard {
  frontText: string;
  backText: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const { url, videoId, topic }: VideoRequest = await req.json();

    if (!url || !videoId || !topic) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      console.error('DeepSeek API key not found in environment');
      throw new Error('DeepSeek API key not found');
    }
    
    console.log('Processing video:', { url, videoId, topic });

    // Get video metadata from YouTube API
    const youtubeApiKey = Deno.env.get('YOUTUBE_TRANSCRIPT_API_KEY');
    let videoMetadata = {
      title: 'YouTube Video',
      author: 'Unknown Creator',
      duration: 600, // 10 minutes default
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      description: 'Educational video content'
    };

    // Try to get video info from YouTube API if available
    if (youtubeApiKey) {
      try {
        const videoInfoResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${youtubeApiKey}&part=snippet,contentDetails`
        );
        
        if (videoInfoResponse.ok) {
          const videoInfo = await videoInfoResponse.json();
          if (videoInfo.items && videoInfo.items.length > 0) {
            const item = videoInfo.items[0];
            videoMetadata = {
              title: item.snippet.title,
              author: item.snippet.channelTitle,
              duration: parseDuration(item.contentDetails.duration),
              thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || videoMetadata.thumbnail,
              description: item.snippet.description
            };
          }
        }
      } catch (error) {
        console.warn('Failed to fetch video metadata:', error);
      }
    }

    // For now, we'll simulate transcript fetching since the YouTube Transcript API
    // requires a Python implementation. In a real implementation, you'd call a
    // Python service or use a JavaScript equivalent.
    const simulatedTranscript = `This is a simulated transcript for the video "${videoMetadata.title}". 
    The video covers important concepts related to ${topic}. Key points include practical strategies, 
    actionable insights, and expert advice. The content is designed to help viewers understand 
    complex topics through clear explanations and real-world examples. Throughout the video, 
    the presenter shares valuable tips and techniques that can be applied immediately.`;

    // Calculate number of questions and flashcards based on duration
    // 1 question + 1 flashcard per 3 minutes
    const questionsCount = Math.max(1, Math.floor(videoMetadata.duration / 180));
    const flashcardsCount = questionsCount;

    // Generate questions using DeepSeek
    const questionsPrompt = `Based on this video transcript about ${topic}:

"${simulatedTranscript}"

Create exactly ${questionsCount} multiple-choice questions that test understanding of the key concepts. Each question should have 4 options with one correct answer and a brief explanation.

Format as JSON array with objects containing:
- questionType: "mcq"
- questionText: string
- options: array of 4 strings
- correctAnswer: string (exact match from options)
- explanation: string

Focus on practical applications and key insights from the video.`;

    const questionsResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: questionsPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!questionsResponse.ok) {
      throw new Error(`DeepSeek API error for questions: ${questionsResponse.status}`);
    }

    const questionsResult = await questionsResponse.json();
    let questions: Question[];
    
    try {
      questions = JSON.parse(questionsResult.choices[0].message.content);
    } catch {
      // Fallback questions if parsing fails
      questions = Array.from({ length: questionsCount }, (_, i) => ({
        questionType: 'mcq' as const,
        questionText: `What is a key takeaway from this video? (Question ${i + 1})`,
        options: ['Key insight A', 'Key insight B', 'Key insight C', 'Key insight D'],
        correctAnswer: 'Key insight A',
        explanation: `This relates to the main concepts discussed in the video about ${topic}.`
      }));
    }

    // Generate flashcards using DeepSeek
    const flashcardsPrompt = `Based on this video transcript about ${topic}:

"${simulatedTranscript}"

Create exactly ${flashcardsCount} flashcards for spaced repetition learning. Each flashcard should have a clear question/prompt on the front and a comprehensive answer on the back.

Format as JSON array with objects containing:
- frontText: string (question or key term)
- backText: string (detailed answer or explanation)

Focus on key concepts, definitions, and actionable insights from the video.`;

    const flashcardsResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: flashcardsPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!flashcardsResponse.ok) {
      throw new Error(`DeepSeek API error for flashcards: ${flashcardsResponse.status}`);
    }

    const flashcardsResult = await flashcardsResponse.json();
    let flashcards: Flashcard[];
    
    try {
      flashcards = JSON.parse(flashcardsResult.choices[0].message.content);
    } catch {
      // Fallback flashcards if parsing fails
      flashcards = Array.from({ length: flashcardsCount }, (_, i) => ({
        frontText: `Key concept ${i + 1} from this video?`,
        backText: `This is an important insight from the video about ${topic} that provides practical value and actionable advice.`
      }));
    }

    const response = {
      success: true,
      video: {
        ...videoMetadata,
        videoId,
        url,
        topic,
        questionsCount: questions.length,
        flashcardsCount: flashcards.length
      },
      questions,
      flashcards
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error processing video:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to process video',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

// Helper function to parse YouTube duration format (PT1H2M3S)
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}