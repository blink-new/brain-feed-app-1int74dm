import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface BookRequest {
  title: string;
  author: string;
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
    const { title, author, topic }: BookRequest = await req.json();

    if (!title || !author || !topic) {
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
    
    console.log('Processing book:', { title, author, topic });

    // Generate book metadata and content using DeepSeek
    const metadataPrompt = `You are a book expert. For the book "${title}" by ${author}, provide:
1. A brief description (2-3 sentences)
2. Key themes and concepts
3. Target audience
4. Main takeaways

Format as JSON with keys: description, themes, audience, takeaways`;

    const metadataResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: metadataPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      console.error('DeepSeek metadata API error:', metadataResponse.status, errorText);
      throw new Error(`DeepSeek API error: ${metadataResponse.status} - ${errorText}`);
    }

    const metadataResult = await metadataResponse.json();
    let bookMetadata;
    
    try {
      bookMetadata = JSON.parse(metadataResult.choices[0].message.content);
    } catch {
      // Fallback if JSON parsing fails
      bookMetadata = {
        description: `A comprehensive guide exploring the key concepts from ${title} by ${author}.`,
        themes: ['Personal Development', 'Self-Improvement'],
        audience: 'General readers interested in personal growth',
        takeaways: ['Key insights and practical applications']
      };
    }

    // Generate questions
    const questionsPrompt = `Based on the book "${title}" by ${author}, create exactly 20 multiple-choice questions that test understanding of key concepts. Each question should have 4 options with one correct answer and a brief explanation.

Format as JSON array with objects containing:
- questionType: "mcq"
- questionText: string
- options: array of 4 strings
- correctAnswer: string (exact match from options)
- explanation: string

Focus on practical applications, key insights, and important concepts from the book.`;

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
        max_tokens: 4000
      })
    });

    if (!questionsResponse.ok) {
      const errorText = await questionsResponse.text();
      console.error('DeepSeek questions API error:', questionsResponse.status, errorText);
      throw new Error(`DeepSeek API error for questions: ${questionsResponse.status} - ${errorText}`);
    }

    const questionsResult = await questionsResponse.json();
    let questions: Question[];
    
    try {
      questions = JSON.parse(questionsResult.choices[0].message.content);
    } catch {
      // Fallback questions if parsing fails
      questions = Array.from({ length: 20 }, (_, i) => ({
        questionType: 'mcq' as const,
        questionText: `What is a key concept from ${title}? (Question ${i + 1})`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        explanation: `This relates to the main themes discussed in ${title} by ${author}.`
      }));
    }

    // Generate flashcards
    const flashcardsPrompt = `Based on the book "${title}" by ${author}, create exactly 20 flashcards for spaced repetition learning. Each flashcard should have a clear question/prompt on the front and a comprehensive answer on the back.

Format as JSON array with objects containing:
- frontText: string (question or key term)
- backText: string (detailed answer or explanation)

Focus on key concepts, definitions, frameworks, and actionable insights from the book.`;

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
        max_tokens: 4000
      })
    });

    if (!flashcardsResponse.ok) {
      const errorText = await flashcardsResponse.text();
      console.error('DeepSeek flashcards API error:', flashcardsResponse.status, errorText);
      throw new Error(`DeepSeek API error for flashcards: ${flashcardsResponse.status} - ${errorText}`);
    }

    const flashcardsResult = await flashcardsResponse.json();
    let flashcards: Flashcard[];
    
    try {
      flashcards = JSON.parse(flashcardsResult.choices[0].message.content);
    } catch {
      // Fallback flashcards if parsing fails
      flashcards = Array.from({ length: 20 }, (_, i) => ({
        frontText: `Key concept ${i + 1} from ${title}?`,
        backText: `This is an important insight from ${title} by ${author} that relates to personal development and growth.`
      }));
    }

    // Store in database (we'll implement this when database is available)
    // For now, return success response
    const response = {
      success: true,
      book: {
        title,
        author,
        topic,
        ...bookMetadata,
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
    console.error('Error processing book:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to process book',
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