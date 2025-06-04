import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SYSTEM_PROMPT, API_CONFIG } from '@/config/globalPrompt';
import type { ChatApiRequest, ChatApiResponse, ConversationContext } from '@/types';
import { Pinecone } from '@pinecone-database/pinecone';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
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

const PINECONE_INDEX_NAME = 'property-embeddings';
const BATCH_SIZE = 5; // Changed from 10 to 5
const MAX_RETRIES = 3;
const MAX_IMAGES_PER_PROPERTY = 10; // Limit images to process

async function fetchPropertiesFromAPI() {
  const queryParams = new URLSearchParams({
    return: 'results,pagination,facets',
    sort: '-created_at',
    "per-page": '100',
    "page": '2'
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
    throw new Error(`Failed to fetch properties: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function getImageCaption(imageUrl: string, retries = 0) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe this property image in detail. Focus on the room type, features, style, condition, and any notable characteristics that would be useful for property search. Keep it concise but descriptive."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 150
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    console.error(`Error getting caption for image ${imageUrl}:`, error.message);

    if (retries < MAX_RETRIES) {
      console.log(`Retrying caption generation... (${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
      return getImageCaption(imageUrl, retries + 1);
    }

    return "Image caption unavailable";
  }
}

async function processPropertyImages(files: any[]) {
  const processedImages = [];
  
  // Sort by sort order and limit to first 10 images
  const sortedFiles = files
    .filter(file => file.mime === 'image/jpeg' && file.media_url)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    .slice(0, MAX_IMAGES_PER_PROPERTY);

  for (const file of sortedFiles) {
    const imageUrl = `${file.media_url}/w=800`;

    try {
      console.log(`Processing image: ${imageUrl}`);
      const caption = await getImageCaption(imageUrl);

      processedImages.push({
        id: file._id,
        url: imageUrl,
        caption: caption,
        sort_order: file.sort,
        file_identifier: file.file_identifier
      });

      // Delay between image processing requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      console.error(`Failed to process image ${imageUrl}:`, error.message);
      processedImages.push({
        id: file._id,
        url: imageUrl,
        caption: "Image processing failed",
        sort_order: file.sort,
        file_identifier: file.file_identifier
      });
    }
  }

  return processedImages;
}

async function createPropertyEmbedding(property: any) {
  // Enhanced text data extraction with comprehensive property information
  const locationInfo = [
    property.address?.street,
    property.address?.address_line_2,
    property.address?.city,
    property.address?.state,
    property.address?.zip_code,
    property.address?.country
  ].filter(Boolean).join(', ');

  const coordinates = property.location?.coordinates && property.location.coordinates.length >= 2
    ? `Coordinates: ${property.location.coordinates[1]}, ${property.location.coordinates[0]}` 
    : '';

  const basicInfo = [
    property.name,
    property.reference,
    `${property.type} for ${property.transaction}`,
    `Price: €${property.price?.toLocaleString()} ${property.currency || 'EUR'}`,
    property.new_construction ? 'New construction' : 'Existing property'
  ].filter(Boolean);

  const roomInfo = [
    `${property.number_of_bedrooms || 0} bedrooms`,
    `${property.number_of_bathrooms || 0} bathrooms`,
    property.builded_area ? `${property.builded_area} sqm built area` : '',
    property.plot_size ? `${property.plot_size} sqm plot size` : '',
    property.details?.terrace_area ? `${property.details.terrace_area} sqm terrace` : ''
  ].filter(Boolean);

  const propertyDetails = [
    property.details?.orientation ? `Orientation: ${property.details.orientation}` : '',
    property.details?.year_of_construction ? `Built in ${property.details.year_of_construction}` : '',
    property.details?.no_of_parking_spots ? `${property.details.no_of_parking_spots} parking spots` : '',
    property.details?.heating ? `Heating: ${property.details.heating}` : '',
    property.details?.heating_type ? `Heating type: ${property.details.heating_type}` : '',
    property.details?.kitchen_type ? `Kitchen: ${property.details.kitchen_type}` : '',
    property.details?.windows_type ? `Windows: ${property.details.windows_type}` : '',
    property.details?.view ? `View: ${property.details.view}` : '',
    property.details?.garden ? `Garden: ${property.details.garden}` : '',
    property.details?.swimming_pool ? 'Swimming pool available' : '',
    property.details?.terrace ? 'Terrace available' : '',
    property.details?.patio ? 'Patio available' : '',
    property.details?.garage ? 'Garage available' : '',
    property.details?.furnished ? 'Furnished' : '',
    property.details?.fully_fitted_kitchen ? 'Fully fitted kitchen' : '',
    property.details?.refurbished ? 'Recently refurbished' : '',
    property.details?.refurbished_kitchen ? 'Refurbished kitchen' : ''
  ].filter(Boolean);

  const features = [
    property.features?.air_conditioning ? 'Air conditioning' : '',
    property.features?.fitted_wardrobes ? 'Fitted wardrobes' : ''
  ].filter(Boolean);

  const amenities = property.additional_amenities?.join(', ') || '';
  
  const description = property.description?.[0]?.text || '';
  
  const imageCaptions = property.processedImages?.map((img: any) => img.caption).join('. ') || '';

  // Combine all information into comprehensive text for embedding
  const textData = [
    ...basicInfo,
    `Location: ${locationInfo}`,
    coordinates,
    ...roomInfo,
    ...propertyDetails,
    ...features,
    amenities ? `Amenities: ${amenities}` : '',
    description ? `Description: ${description}` : '',
    imageCaptions ? `Visual features: ${imageCaptions}` : ''
  ].filter(Boolean).join('. ');

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: textData,
    });

    return response.data[0].embedding;
  } catch (error: any) {
    console.error(`Error creating embedding for property ${property._id}:`, error.message);
    throw error;
  }
}

async function upsertToPinecone(propertyData: any[]) {
  try {
    const index = pinecone.index(PINECONE_INDEX_NAME);

    const vectors = propertyData.map((property: any) => ({
      id: property._id,
      values: property.embedding,
      metadata: {
        name: property.name || '',
        reference: property.reference || '',
        type: property.type || '',
        city: property.address?.city || '',
        state: property.address?.state || '',
        country: property.address?.country || '',
        street: property.address?.street || '',
        zip_code: property.address?.zip_code || '',
        latitude: property.location?.coordinates?.[1] || 0,
        longitude: property.location?.coordinates?.[0] || 0,
        price: property.price || 0,
        currency: property.currency || 'EUR',
        bedrooms: property.number_of_bedrooms || 0,
        bathrooms: property.number_of_bathrooms || 0,
        built_area: property.builded_area || 0,
        plot_size: property.plot_size || 0,
        terrace_area: property.details?.terrace_area || 0,
        new_construction: property.new_construction || false,
        transaction: property.transaction || '',
        orientation: property.details?.orientation || '',
        heating: property.details?.heating || '',
        heating_type: property.details?.heating_type || '',
        kitchen_type: property.details?.kitchen_type || '',
        windows_type: property.details?.windows_type || '',
        view: property.details?.view || '',
        garden: property.details?.garden || '',
        images_count: property.processedImages?.length || 0,
        main_image_url: property.processedImages?.[0]?.url || '',
        has_terrace: !!property.details?.terrace,
        has_garden: !!property.details?.garden,
        has_pool: !!property.details?.swimming_pool,
        has_garage: !!property.details?.garage,
        has_parking: (property.details?.no_of_parking_spots || 0) > 0,
        parking_spots: property.details?.no_of_parking_spots || 0,
        has_ac: !!property.features?.air_conditioning,
        has_fitted_wardrobes: !!property.features?.fitted_wardrobes,
        year_built: property.details?.year_of_construction || 0,
        status: property.status || '',
        furnished: property.details?.furnished || '',
        fully_fitted_kitchen: !!property.details?.fully_fitted_kitchen,
        refurbished: !!property.details?.refurbished,
        refurbished_kitchen: !!property.details?.refurbished_kitchen,
        hot_water: property.details?.hot_water || '',
        water_heater: property.details?.water_heater || '',
        building_floors: property.details?.no_of_building_floor || 0,
        flats_per_floor: property.details?.no_of_flats_per_floor || 0,
        building_status: property.details?.building_status || '',
        shutters: property.details?.shutters || '',
        windows_material: property.details?.windows_material || '',
        windows_location: property.details?.windows_location || '',
        included_in_price: property.details?.included_in_price || '',
        description: property.description?.[0]?.text || ''
      }
    }));

    await index.upsert(vectors);
    console.log(`Successfully upserted ${vectors.length} properties to Pinecone`);

  } catch (error: any) {
    console.error('Error upserting to Pinecone:', error.message);
    throw error;
  }
}

async function processPropertiesBatch(properties: any[]) {
  const processedProperties = [];

  for (const property of properties) {
    try {
      console.log(`Processing property: ${property.name} (${property._id})`);

      // Process images (limited to 10)
      const processedImages = await processPropertyImages(property.files || []);
      property.processedImages = processedImages;

      // Create embedding with comprehensive data
      const embedding = await createPropertyEmbedding(property);
      property.embedding = embedding;

      processedProperties.push(property);

      console.log(`Completed processing property: ${property.name}`);

    } catch (error: any) {
      console.error(`Failed to process property ${property._id}:`, error.message);
      // Continue with next property even if one fails
    }
  }

  return processedProperties;
}

export async function fetchAndEmbedProperties() {
  try {
    console.log('Starting property fetch and embedding process...');

    console.log('Fetching properties from API...');
    const apiResponse = await fetchPropertiesFromAPI();
    const properties = apiResponse.data?.properties || [];

    if (properties.length === 0) {
      console.log('No properties found to process');
      return { success: true, processed: 0 };
    }

    console.log(`Found ${properties.length} properties to process`);

    const allProcessedProperties = [];

    // Process in batches of 5 properties
    for (let i = 0; i < properties.length; i += BATCH_SIZE) {
      const batch = properties.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(properties.length / BATCH_SIZE)} (${batch.length} properties)`);

      const processedBatch = await processPropertiesBatch(batch);
      allProcessedProperties.push(...processedBatch);

      if (processedBatch.length > 0) {
        await upsertToPinecone(processedBatch);
      }

      // Wait between batches to avoid rate limiting
      if (i + BATCH_SIZE < properties.length) {
        console.log('Waiting before processing next batch...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Increased delay
      }
    }

    console.log(`Successfully processed and embedded ${allProcessedProperties.length} properties`);

    return {
      success: true,
      processed: allProcessedProperties.length,
      total_found: properties.length,
      properties: allProcessedProperties
    };

  } catch (error: any) {
    console.error('Error in fetchAndEmbedProperties:', error.message);
    throw error;
  }
}

interface RequestBody extends ChatApiRequest { }

export async function GET(request: NextRequest): Promise<NextResponse<ChatApiResponse | { error: string }>> {
  try {
    const result = await fetchAndEmbedProperties();
    return NextResponse.json({ 
      message: 'Properties fetched and embedded successfully',
      ...result 
    });
  } catch (error: any) {
    console.error('Error in GET:', error.message);
    return NextResponse.json(
      { error: `Failed to process properties: ${error.message}` },
      { status: 500 }
    );
  }
}

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

          messages.push({
            role: 'function',
            name: 'fetchProperties',
            content: JSON.stringify(properties)
          });

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