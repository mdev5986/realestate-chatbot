// src/types/index.ts
export interface PropertyPreferences {
  readonly budget?: {
    readonly min: number;
    readonly max: number;
  };
  readonly location?: string;
  readonly propertyType?: PropertyType;
  readonly bedrooms?: number;
  readonly bathrooms?: number;
  readonly amenities?: readonly string[];
  readonly purchaseType?: PurchaseType;
  readonly squareFootage?: {
    readonly min: number;
    readonly max: number;
  };
  readonly yearBuilt?: {
    readonly min: number;
    readonly max: number;
  };
  readonly parkingSpaces?: number;
  readonly petFriendly?: boolean;
  readonly schoolDistrict?: string;
  readonly transportation?: readonly string[];
}

export interface Property {
  readonly id: string;
  readonly address: string;
  readonly city: string;
  readonly state: string;
  readonly zipCode: string;
  readonly price: number;
  readonly propertyType: PropertyType;
  readonly bedrooms: number;
  readonly bathrooms: number;
  readonly squareFootage: number;
  readonly yearBuilt: number;
  readonly amenities: readonly string[];
  readonly description: string;
  readonly images: readonly string[];
  readonly listingAgent: {
    readonly name: string;
    readonly phone: string;
    readonly email: string;
  };
  readonly status: PropertyStatus;
  readonly dateListed: Date;
  readonly mlsNumber?: string;
}

export interface HelpTicket {
  readonly id: string;
  readonly propertyAddress: string;
  readonly issueType: IssueType;
  readonly title: string;
  readonly description: string;
  readonly priority: Priority;
  readonly contactInfo: {
    readonly name: string;
    readonly phone?: string;
    readonly email?: string;
    readonly preferredContact: ContactMethod;
  };
  readonly status: TicketStatus;
  readonly assignedTo?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly estimatedResolution?: string;
  readonly actualResolution?: Date;
  readonly cost?: number;
  readonly notes: readonly string[];
  readonly attachments?: readonly string[];
}

export interface MarketAnalysis {
  readonly location: string;
  readonly averagePrice: number;
  readonly pricePerSquareFoot: number;
  readonly daysOnMarket: number;
  readonly priceChange: {
    readonly percentage: number;
    readonly timeframe: Timeframe;
  };
  readonly inventory: number;
  readonly demandScore: number;
  readonly appreciation: {
    readonly historical: number;
    readonly projected: number;
  };
  readonly comparableProperties: readonly Property[];
  readonly marketTrends: readonly string[];
  readonly investmentScore?: number;
}

export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly role: UserRole;
  readonly preferences: PropertyPreferences;
  readonly savedProperties: readonly string[];
  readonly activeTickets: readonly string[];
  readonly createdAt: Date;
  readonly lastActive: Date;
}

export interface ChatMessage {
  readonly id: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly timestamp: Date;
  readonly metadata?: {
    readonly propertyRecommendations?: readonly Property[];
    readonly ticketCreated?: HelpTicket;
    readonly marketData?: MarketAnalysis;
    readonly actionTaken?: string;
  };
}

export interface ConversationContext {
  readonly userId?: string;
  readonly userPreferences?: PropertyPreferences;
  readonly activeTickets?: readonly HelpTicket[];
  readonly recentProperties?: readonly Property[];
  readonly userLocation?: string;
  readonly sessionId: string;
  readonly conversationGoal?: ConversationGoal;
}

export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
}

export interface PropertySearchParams {
  readonly location?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly propertyType?: PropertyType;
  readonly bedrooms?: number;
  readonly bathrooms?: number;
  readonly minSquareFootage?: number;
  readonly maxSquareFootage?: number;
  readonly amenities?: readonly string[];
  readonly sortBy?: SortOption;
  readonly sortOrder?: SortOrder;
  readonly limit?: number;
  readonly offset?: number;
}

export interface TicketSearchParams {
  readonly status?: TicketStatus;
  readonly priority?: Priority;
  readonly issueType?: IssueType;
  readonly propertyAddress?: string;
  readonly dateRange?: {
    readonly start: Date;
    readonly end: Date;
  };
  readonly assignedTo?: string;
}

export interface PropertySearchForm {
  readonly location: string;
  readonly priceRange: readonly [number, number];
  readonly propertyType: PropertyType | 'any';
  readonly bedrooms: number | 'any';
  readonly bathrooms: number | 'any';
  readonly amenities: readonly string[];
}

export interface TicketCreationForm {
  readonly propertyAddress: string;
  readonly issueType: IssueType;
  readonly title: string;
  readonly description: string;
  readonly priority: Priority;
  readonly contactName: string;
  readonly contactPhone: string;
  readonly contactEmail: string;
  readonly preferredContact: ContactMethod;
  readonly isEmergency: boolean;
  readonly attachments?: readonly File[];
}

export interface OpenAIMessage {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
}

export interface ChatApiRequest {
  readonly message: string;
  readonly conversationHistory: readonly OpenAIMessage[];
  readonly context?: ConversationContext;
}

export interface ChatApiResponse {
  readonly message: string;
  readonly usage?: {
    readonly prompt_tokens: number;
    readonly completion_tokens: number;
    readonly total_tokens: number;
  };
}

// Enums and Constants
export const PROPERTY_TYPES = [
  'apartment',
  'house',
  'condo',
  'townhouse',
  'commercial',
  'land'
] as const;

export const ISSUE_TYPES = [
  'maintenance',
  'emergency',
  'tenant',
  'general',
  'electrical',
  'plumbing',
  'hvac',
  'appliance'
] as const;

export const PRIORITY_LEVELS = [
  'low',
  'medium',
  'high',
  'urgent'
] as const;

export const TICKET_STATUSES = [
  'open',
  'assigned',
  'in-progress',
  'resolved',
  'closed'
] as const;

export const USER_ROLES = [
  'buyer',
  'seller',
  'renter',
  'landlord',
  'agent',
  'investor'
] as const;

export const MESSAGE_ROLES = [
  'user',
  'assistant',
  'system'
] as const;

export const CONTACT_METHODS = [
  'phone',
  'email',
  'text'
] as const;

export const PROPERTY_STATUSES = [
  'available',
  'pending',
  'sold',
  'rented'
] as const;

export const PURCHASE_TYPES = [
  'buy',
  'rent',
  'invest'
] as const;

export const CONVERSATION_GOALS = [
  'property_search',
  'ticket_creation',
  'market_analysis',
  'general_help'
] as const;

export const SORT_OPTIONS = [
  'price',
  'date',
  'size',
  'relevance'
] as const;

export const SORT_ORDERS = [
  'asc',
  'desc'
] as const;

export const TIMEFRAMES = [
  '1month',
  '3months',
  '6months',
  '1year'
] as const;

// Type unions
export type PropertyType = typeof PROPERTY_TYPES[number];
export type IssueType = typeof ISSUE_TYPES[number];
export type Priority = typeof PRIORITY_LEVELS[number];
export type TicketStatus = typeof TICKET_STATUSES[number];
export type UserRole = typeof USER_ROLES[number];
export type MessageRole = typeof MESSAGE_ROLES[number];
export type ContactMethod = typeof CONTACT_METHODS[number];
export type PropertyStatus = typeof PROPERTY_STATUSES[number];
export type PurchaseType = typeof PURCHASE_TYPES[number];
export type ConversationGoal = typeof CONVERSATION_GOALS[number];
export type SortOption = typeof SORT_OPTIONS[number];
export type SortOrder = typeof SORT_ORDERS[number];
export type Timeframe = typeof TIMEFRAMES[number];

// Utility types
export type PropertyFilter = Partial<PropertySearchParams>;
export type TicketFilter = Partial<TicketSearchParams>;