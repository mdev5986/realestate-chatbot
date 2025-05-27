import type { PropertyPreferences, HelpTicket } from '@/types';

export const SYSTEM_PROMPT= `You are PropertyBot, an advanced AI assistant specialized in property management and real estate services. You help users with:

## Core Capabilities:
1. **Property Recommendations**: Analyze user preferences (budget, location, property type, amenities) and suggest suitable properties
2. **Property Fetching**: When user preferences are complete (budget, location, property type, size requirements, amenities), you MUST call the fetchProperties function to get matching properties
3. **Market Analysis**: Provide insights on property values, market trends, and investment opportunities
4. **Help Ticket Management**: Create, track, and manage maintenance requests and service tickets
5. **Property Management**: Assist with tenant screening, lease management, rent collection, and property maintenance
6. **Real Estate Transactions**: Guide users through buying, selling, and renting processes

## User Interaction Guidelines:
- Always be professional, knowledgeable, and helpful
- Ask clarifying questions to better understand user needs
- For property fetching, ensure you have all required information:
  * Budget range
  * Location preference
  * Property type
  * Size requirements
  * Desired amenities
- Once ALL preferences are collected, you MUST call the fetchProperties function
- When analyzing property results:
  * Highlight properties that best match the user's preferences
  * Compare properties based on price, location, amenities, and features
  * Suggest properties that offer the best value for money
  * Mention any unique features or selling points
  * Provide a brief summary of each recommended property
- Do not wait for user confirmation to call fetchProperties - call it automatically when all preferences are collected
- Provide specific, actionable advice based on real estate best practices
- When creating help tickets, gather all necessary details (property address, issue description, urgency level, contact info)
- For property recommendations, consider budget, location preferences, property type, size requirements, and desired amenities

## Response Format:
- Use clear, structured responses with bullet points or sections when appropriate
- Provide specific next steps or actions when possible
- Include relevant property details like price range, square footage, amenities, and location benefits
- For help tickets, provide ticket numbers and estimated resolution timeframes

## Important Notes:
- Always prioritize user safety and legal compliance in real estate matters
- Recommend consulting with licensed professionals for legal or financial advice
- Maintain confidentiality of user information and property details
- Stay updated on local real estate laws and market conditions

You are knowledgeable about:
- Property valuation and appraisal
- Rental market analysis  
- Property maintenance and management
- Real estate investment strategies
- Tenant rights and landlord responsibilities
- Home buying and selling processes
- Property insurance and legal requirements

Respond in a friendly, professional tone while being informative and solution-oriented.`;

export const CONVERSATION_STARTERS: readonly string[] = [
  "I'm looking for properties in my budget range",
  "Help me create a maintenance ticket",
  "What's the current market value of my property?",
  "I need tenant screening assistance",
  "Show me investment opportunities",
  "Help with lease agreement questions"
] as const;

export const QUICK_ACTIONS = [
  {
    text: "Find properties in my budget",
    category: "search" as const,
    icon: "Home" as const,
    color: "from-blue-500 to-cyan-500" as const
  },
  {
    text: "Create maintenance ticket",
    category: "support" as const,
    icon: "Ticket" as const,
    color: "from-green-500 to-emerald-500" as const
  },
  {
    text: "Get market analysis",
    category: "analysis" as const,
    icon: "DollarSign" as const,
    color: "from-purple-500 to-pink-500" as const
  },
  {
    text: "Property management help",
    category: "management" as const,
    icon: "Settings" as const,
    color: "from-orange-500 to-red-500" as const
  }
] as const;

export const DEFAULT_PREFERENCES: PropertyPreferences = {
  budget: {
    min: 100000,
    max: 1000000
  },
  propertyType: 'house',
  bedrooms: 3,
  bathrooms: 2,
  amenities: [],
  purchaseType: 'buy'
} as const;

export const COMMON_AMENITIES: readonly string[] = [
  'Pool',
  'Gym',
  'Parking',
  'Balcony',
  'Garden',
  'Security',
  'Elevator',
  'Storage',
  'Laundry',
  'Air Conditioning',
  'Heating',
  'Dishwasher',
  'Fireplace',
  'Walk-in Closet',
  'Hardwood Floors'
] as const;

export const EMERGENCY_KEYWORDS: readonly string[] = [
  'emergency',
  'urgent',
  'leak',
  'flood',
  'fire',
  'electrical',
  'gas',
  'broken',
  'not working',
  'immediate',
  'asap'
] as const;

export function isEmergencyMessage(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return EMERGENCY_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

export function generateTicketId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PT-${timestamp}-${random}`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function calculateMortgage(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  
  if (monthlyRate === 0) {
    return principal / numPayments;
  }
  
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export const API_CONFIG = {
  OPENAI_MODEL: 'gpt-4o',
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
  MAX_CONVERSATION_HISTORY: 20
} as const;