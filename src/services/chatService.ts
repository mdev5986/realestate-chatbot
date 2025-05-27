import type { 
  OpenAIMessage, 
  ConversationContext, 
  ChatApiResponse,
  PropertyPreferences,
  HelpTicket
} from '@/types';

export class ChatApiService {
  private conversationHistory: OpenAIMessage[] = [];

  async sendMessage(
    userMessage: string, 
    context?: ConversationContext
  ): Promise<string> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: this.conversationHistory,
          context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error: string };
        throw new Error(errorData.error || 'API request failed');
      }

      const data = await response.json() as ChatApiResponse;
      
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: data.message }
      );

      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return data.message;
    } catch (error) {
      console.error('Chat API Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async streamMessage(
    userMessage: string,
    onChunk: (chunk: string) => void,
    context?: ConversationContext
  ): Promise<void> {
    try {
      const response = await fetch('/api/chat', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: this.conversationHistory,
          context
        }),
      });

      if (!response.ok) {
        throw new Error('Streaming request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              // Update conversation history
              this.conversationHistory.push(
                { role: 'user', content: userMessage },
                { role: 'assistant', content: fullResponse }
              );

              if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
              }
              return;
            }

            try {
              const parsed = JSON.parse(data) as { content: string };
              if (parsed.content) {
                fullResponse += parsed.content;
                onChunk(parsed.content);
              }
            } catch {
              // Ignore parsing errors for non-JSON lines
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming Error:', error);
      onChunk('I apologize, but I encountered an error. Please try again.');
    }
  }

  // Specialized methods for property-specific actions
  async getPropertyRecommendations(preferences: PropertyPreferences): Promise<string> {
    const prompt = `I'm looking for property recommendations with these preferences: ${JSON.stringify(preferences, null, 2)}`;
    return this.sendMessage(prompt, { 
      sessionId: this.generateSessionId(),
      userPreferences: preferences,
      conversationGoal: 'property_search'
    });
  }

  async createHelpTicket(ticketData: Partial<HelpTicket>): Promise<string> {
    const prompt = `I need to create a help ticket: ${JSON.stringify(ticketData, null, 2)}`;
    return this.sendMessage(prompt, {
      sessionId: this.generateSessionId(),
      conversationGoal: 'ticket_creation'
    });
  }

  async getMarketAnalysis(location: string, propertyType?: string): Promise<string> {
    const prompt = `Can you provide a market analysis for ${location}${propertyType ? ` for ${propertyType} properties` : ''}?`;
    return this.sendMessage(prompt, { 
      sessionId: this.generateSessionId(),
      userLocation: location,
      conversationGoal: 'market_analysis'
    });
  }

  async fetchProperties(): Promise<string> {
    const prompt = "Please fetch properties based on the user's preferences and requirements.";
    return this.sendMessage(prompt, {
      sessionId: this.generateSessionId(),
      conversationGoal: 'property_search'
    });
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getConversationHistory(): readonly OpenAIMessage[] {
    return [...this.conversationHistory];
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Utility functions for property management
export const PropertyUtils = {
  formatPrice: (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  },

  calculateMortgage: (
    principal: number,
    rate: number,
    years: number
  ): number => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    
    if (monthlyRate === 0) {
      return principal / numPayments;
    }
    
    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    );
  },

  generateTicketId: (): string => {
    return `PT-${Date.now().toString().slice(-6)}`;
  },

  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },

  formatDate: (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  calculateSquareFootagePrice: (price: number, sqft: number): number => {
    return Math.round(price / sqft);
  },

  formatSquareFootage: (sqft: number): string => {
    return new Intl.NumberFormat('en-US').format(sqft) + ' sq ft';
  }
} as const;