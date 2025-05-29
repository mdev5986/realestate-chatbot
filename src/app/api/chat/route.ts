import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SYSTEM_PROMPT, API_CONFIG } from '@/config/globalPrompt';
import type { ChatApiRequest, ChatApiResponse, ConversationContext } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const functions: OpenAI.Chat.Completions.ChatCompletionCreateParams.Function[] = [
  {
    name: 'fetchProperties',
    description: 'Fetch properties based on user preferences and requirements',
    parameters: {
      type: 'object',
      properties: {
        preferences: {
          type: 'object',
          properties: {}
        }
      },
      required: ['preferences']
    }
  }
];

async function fetchPropertiesFromAPI() {
  const queryParams = new URLSearchParams({
    return: 'results,pagination,facets',
    sort: '-created_at',
    "per-page": '50'
  });

  const response = await fetch(
    `https://api.tesoro.estate/property/property-website/filter-properties?${queryParams}`,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Api-Key': 'mV4lPR1LVy3EmITLvZMsUdyLUPKGdEgFv6b'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch properties');
  }

  return response.json();
}

interface RequestBody extends ChatApiRequest {}

export async function POST(request: NextRequest): Promise<NextResponse<ChatApiResponse | { error: string }>> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    let body: RequestBody;
    try {
      body = await request.json() as RequestBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { message, conversationHistory, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (!Array.isArray(conversationHistory)) {
      return NextResponse.json(
        { error: 'Conversation history must be an array' },
        { status: 400 }
      );
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      })),
      { 
        role: 'user' as const, 
        content: message + (context ? buildContextString(context) : '')
      }
    ];

    if (messages.length > API_CONFIG.MAX_CONVERSATION_HISTORY + 2) {
      const systemMessage = messages[0];
      const recentMessages = messages.slice(-(API_CONFIG.MAX_CONVERSATION_HISTORY + 1));
      messages.splice(0, messages.length, systemMessage, ...recentMessages);
    }

    const completion = await openai.chat.completions.create({
      model: API_CONFIG.OPENAI_MODEL,
      messages,
      max_tokens: API_CONFIG.MAX_TOKENS,
      temperature: API_CONFIG.TEMPERATURE,
      stream: false,
      functions,
      function_call: 'auto'
    });

    const assistantResponse = completion.choices[0]?.message;

    if (!assistantResponse) {
      throw new Error('No response from OpenAI');
    }

    if (assistantResponse.function_call) {
      const functionName = assistantResponse.function_call.name;
      if (functionName === 'fetchProperties') {
        try {
          const properties = await fetchPropertiesFromAPI();
          
          // Add the API response to the conversation for the AI to analyze
          messages.push({
            role: 'function',
            name: 'fetchProperties',
            content: JSON.stringify(properties)
          });

          // Get a new completion with the function results
          const completionWithResults = await openai.chat.completions.create({
            model: API_CONFIG.OPENAI_MODEL,
            messages,
            max_tokens: API_CONFIG.MAX_TOKENS,
            temperature: API_CONFIG.TEMPERATURE,
            stream: false
          });

          return NextResponse.json({
            message: completionWithResults.choices[0]?.message?.content || "I've found some properties that match your preferences.",
            properties: properties
          });
        } catch (error) {
          console.error('Error fetching properties:', error);
          return NextResponse.json({
            message: "I apologize, but I encountered an error while fetching properties. Please try again.",
            error: true
          });
        }
      }
    }

    const response: ChatApiResponse = {
      message: assistantResponse.content || '',
      usage: completion.usage ? {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens
      } : undefined
    };

    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error('OpenAI API Error:', error);
    
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }
      
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      if (error.status === 400) {
        return NextResponse.json(
          { error: 'Invalid request to OpenAI API' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<Response> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let body: RequestBody;
    try {
      body = await request.json() as RequestBody;
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { message, conversationHistory, context } = body;

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      })),
      { 
        role: 'user' as const, 
        content: message + (context ? buildContextString(context) : '')
      }
    ];

    if (messages.length > API_CONFIG.MAX_CONVERSATION_HISTORY + 2) {
      const systemMessage = messages[0];
      const recentMessages = messages.slice(-(API_CONFIG.MAX_CONVERSATION_HISTORY + 1));
      messages.splice(0, messages.length, systemMessage, ...recentMessages);
    }

    const stream = await openai.chat.completions.create({
      model: API_CONFIG.OPENAI_MODEL,
      messages,
      max_tokens: API_CONFIG.MAX_TOKENS,
      temperature: API_CONFIG.TEMPERATURE,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              const data = JSON.stringify({ content });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (streamError) {
          console.error('Streaming error:', streamError);
          controller.error(streamError);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: unknown) {
    console.error('Streaming API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Streaming failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function buildContextString(context: ConversationContext): string {
  let contextStr = '\n\n[CONTEXT]';
  
  if (context.userPreferences) {
    contextStr += '\nUser Preferences: ' + JSON.stringify(context.userPreferences, null, 2);
  }
  
  if (context.activeTickets && context.activeTickets.length > 0) {
    contextStr += '\nActive Tickets: ' + JSON.stringify(context.activeTickets, null, 2);
  }
  
  if (context.userLocation) {
    contextStr += '\nUser Location: ' + context.userLocation;
  }

  if (context.conversationGoal) {
    contextStr += '\nConversation Goal: ' + context.conversationGoal;
  }
  
  return contextStr + '\n[/CONTEXT]';
}