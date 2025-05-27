# PropertyBot - AI-Powered Real Estate Chatbot

A sophisticated TypeScript-based AI chatbot specialized in property management and real estate services, built with Next.js 14, React, and OpenAI's GPT-4o.

## 🏠 Features

- **Property Recommendations**: AI-powered property suggestions based on user preferences
- **Help Ticket Management**: Create and track maintenance requests with priority levels
- **Market Analysis**: Real-time property market insights and investment advice
- **Property Management**: Tenant screening, lease management, and rent collection assistance
- **Real Estate Transactions**: Guidance through buying, selling, and renting processes
- **Strict TypeScript**: Full type safety with strict mode enabled
- **Production-Ready**: Secure server-side API implementation

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/))

### 1. Create Project

```bash
# Create Next.js project
npx create-next-app@latest property-chatbot --typescript --tailwind --eslint --app
cd property-chatbot

# Install additional dependencies
npm install openai lucide-react clsx date-fns uuid
npm install -D @types/uuid @tailwindcss/forms
```

### 2. Project Structure

Create the following folder structure:

```
src/
├── app/
│   ├── api/chat/
│   │   └── route.ts
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   └── index.ts
│   └── PropertyChatBot.tsx
├── config/
│   └── globalPrompt.ts
├── services/
│   └── chatService.ts
└── types/
    └── index.ts
```

### 3. Environment Setup

Create `.env.local` in your project root:

```bash
# Required
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Optional
NEXT_PUBLIC_API_BASE_URL=https://api.openai.com/v1
NEXT_public_MODEL_NAME=gpt-4o
NEXT_PUBLIC_MAX_TOKENS=1000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Copy Project Files

Copy all the provided TypeScript files into their respective locations:

1. **`src/types/index.ts`** - Complete type definitions
2. **`src/config/globalPrompt.ts`** - AI prompts and configuration
3. **`src/app/api/chat/route.ts`** - Production API endpoint
4. **`src/services/chatService.ts`** - Chat API service
5. **`src/components/PropertyChatBot.tsx`** - Main chat component
6. **`src/app/page.tsx`** - Main page component
7. **`src/app/layout.tsx`** - Root layout
8. **`src/app/globals.css`** - Global styles
9. **`tailwind.config.js`** - Tailwind configuration
10. **`tsconfig.json`** - TypeScript strict configuration
11. **`package.json`** - Dependencies
12. **Configuration files** (next.config.js, postcss.config.js, .eslintrc.json)

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Complete File List

### Core Application Files

1. **`package.json`** - Project dependencies and scripts
2. **`tsconfig.json`** - Strict TypeScript configuration
3. **`tailwind.config.js`** - Tailwind CSS configuration
4. **`next.config.js`** - Next.js configuration
5. **`postcss.config.js`** - PostCSS configuration
6. **`.eslintrc.json`** - ESLint configuration
7. **`.env.local`** - Environment variables (create this)
8. **`.env.example`** - Environment variables example
9. **`.gitignore`** - Git ignore rules

### Source Files

10. **`src/types/index.ts`** - Complete TypeScript interfaces and types
11. **`src/config/globalPrompt.ts`** - AI system prompts and utilities
12. **`src/app/api/chat/route.ts`** - Secure API endpoint for OpenAI
13. **`src/services/chatService.ts`** - Chat API service class
14. **`src/components/PropertyChatBot.tsx`** - Main chatbot component
15. **`src/components/ui/index.ts`** - Reusable UI components
16. **`src/app/page.tsx`** - Home page component
17. **`src/app/layout.tsx`** - Root layout component
18. **`src/app/globals.css`** - Global styles and animations

### Documentation

19. **`README.md`** - This setup guide

## 🔧 Key Features Implemented

### ✅ Strict TypeScript
- Full type safety with strict mode
- Readonly interfaces for immutable data
- Comprehensive type definitions for all components
- No implicit any types allowed

### ✅ Production-Ready Architecture
- Server-side API routes for security
- Proper error handling and validation
- Rate limiting and usage tracking
- Environment variable management

### ✅ AI Integration
- GPT-4o integration with streaming support
- Context-aware conversations
- Specialized prompts for real estate
- Conversation history management

### ✅ Modern UI/UX
- Responsive design with Tailwind CSS
- Smooth animations and transitions
- Accessibility features
- Mobile-optimized interface

### ✅ Real Estate Features
- Property search and recommendations
- Help ticket creation and tracking
- Market analysis and insights
- Property management tools

## 🛡️ Security Implementation

### API Security
- Server-side OpenAI API calls only
- Input validation and sanitization
- Rate limiting protection
- Error handling without data leakage

### Environment Security
- API keys stored server-side only
- Environment variable validation
- Secure headers configuration
- CORS protection

## 🧪 Testing Your Implementation

### 1. Basic Functionality Test
```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
# You should see the PropertyBot interface
```

### 2. Chat Functionality Test
Try these example conversations:

**Property Search:**
- "I'm looking for a 3-bedroom house under $400k"
- "Show me luxury condos with amenities"
- "Find investment properties in downtown area"

**Help Tickets:**
- "Create a maintenance ticket for broken AC"
- "Emergency: Water leak in unit 2B"
- "Schedule HVAC maintenance"

**Market Analysis:**
- "What's the current market trend for condos?"
- "Analyze property values in Miami"
- "Should I buy or rent in current market?"

### 3. Error Handling Test
- Try sending empty messages
- Test with invalid API key
- Test network connectivity issues

## 🚀 Production Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Set environment variables in Vercel dashboard
# Add OPENAI_API_KEY in Vercel project settings
```

### Other Platforms
- **Netlify**: Good for static sites
- **Railway**: Easy deployment with databases
- **DigitalOcean**: Full control over server
- **AWS/Azure**: Enterprise-grade solutions

### Environment Variables for Production
```bash
# Required in production
OPENAI_API_KEY=sk-your-production-api-key
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Optional
DATABASE_URL=your-database-connection-string
REDIS_URL=your-redis-connection-string
```

## 🔧 Customization Guide

### 1. Modify AI Behavior
Edit `src/config/globalPrompt.ts`:
```typescript
export const SYSTEM_PROMPT = `
Your customized system prompt here...
Add specific instructions for your real estate business
Include local market knowledge
Customize response style and tone
`;
```

### 2. Add New Property Types
Update `src/types/index.ts`:
```typescript
export const PROPERTY_TYPES = [
  'apartment',
  'house',
  'condo',
  'townhouse',
  'commercial',
  'land',
  'your-new-type' // Add here
] as const;
```

### 3. Custom Quick Actions
Modify `src/config/globalPrompt.ts`:
```typescript
export const QUICK_ACTIONS = [
  {
    text: "Your custom action",
    category: "custom" as const,
    icon: "YourIcon" as const,
    color: "from-custom-500 to-custom-600" as const
  },
  // ... existing actions
] as const;
```

### 4. Styling Customization
Update `src/app/globals.css` and `tailwind.config.js` for:
- Brand colors
- Typography
- Animations
- Component styles

## 🔌 Integration Options

### Database Integration
```typescript
// Add to your API route
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Store conversations, user preferences, tickets
```

### External APIs
```typescript
// Real estate data APIs
import { ZillowAPI } from 'zillow-api';
import { MLSService } from 'mls-service';

// Add to your chat service for real property data
```

### Authentication
```typescript
// Add NextAuth.js for user management
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Secure user sessions and preferences
```

## 🐛 Troubleshooting

### Common Issues

**1. TypeScript Errors**
```bash
# Check for type errors
npm run type-check

# Fix common issues:
# - Add proper return types
# - Handle null/undefined values
# - Use readonly for immutable data
```

**2. OpenAI API Errors**
```bash
# Check API key validity
# Verify rate limits
# Check OpenAI service status
```

**3. Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**4. Styling Issues**
```bash
# Rebuild Tailwind CSS
npm run build

# Check for conflicting styles
# Verify Tailwind configuration
```

### Performance Optimization

**1. API Response Caching**
```typescript
// Add response caching in API route
const cache = new Map();
const cacheKey = `${userId}-${messageHash}`;
```

**2. Image Optimization**
```typescript
// Use Next.js Image component
import Image from 'next/image';
```

**3. Bundle Analysis**
```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer
```

## 📈 Monitoring & Analytics

### Error Tracking
```bash
# Add Sentry for error monitoring
npm install @sentry/nextjs
```

### Performance Monitoring
```bash
# Add performance monitoring
npm install @vercel/analytics @vercel/speed-insights
```

### Usage Analytics
```typescript
// Track user interactions
// Monitor API usage
// Analyze conversation patterns
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow TypeScript strict mode
4. Add proper type definitions
5. Test thoroughly
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Create Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

### Getting Help
- Check OpenAI API documentation
- Review Next.js documentation
- Check TypeScript handbook
- Create GitHub issues for bugs

### Common Resources
- [OpenAI Platform](https://platform.openai.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev/)

---

**Built with ❤️ for the real estate community using strict TypeScript and modern web technologies**