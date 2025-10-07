# Mot du jour

A French mental health and wellness application that delivers personalized daily messages via SMS. Built with **Next.js 14**, featuring AI-powered message generation, subscription management, and automated delivery systems.

**Repository: [https://github.com/lilsouris/mot.du.jour.git](https://github.com/lilsouris/mot.du.jour.git)**

## Features

### Core Functionality

- **Daily SMS Messages**: Personalized messages delivered via SMS to transform mental well-being
- **AI-Powered Content**: Multiple AI providers (Claude, OpenAI) with web automation fallbacks
- **Subscription Plans**: Personal (4.99€), Family (3.99€/user), and Gift (4.99€) tiers
- **Multi-language Support**: French-optimized content and interface
- **Browser Extension**: Chrome extension for manual message generation

### User Management

- **Authentication**: Supabase Auth with secure session management
- **Team Management**: Family plan support with invitations and role-based access
- **User Profiles**: Phone number validation, subscription tracking, and preferences
- **Activity Logs**: Comprehensive tracking of user actions and system events

### Dashboard Features

- **Personal Dashboard**: Message history, subscription status, and account management
- **Team Dashboard**: Family plan management with member invitations
- **Security Settings**: Password management and account security
- **Activity Tracking**: Real-time logs of user interactions

### Payment & Subscription

- **Stripe Integration**: Secure payment processing with Customer Portal
- **Multiple Plans**: Personal, Family, and Gift subscription options
- **Trial Period**: 14-day free trial for new users
- **Subscription Management**: Easy upgrades, downgrades, and cancellations

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: [Supabase Auth](https://supabase.com/auth)
- **Payments**: [Stripe](https://stripe.com/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **AI Providers**: [Claude API](https://anthropic.com/), [OpenAI API](https://openai.com/)
- **SMS Delivery**: [Twilio](https://twilio.com/)
- **Automation**: [Puppeteer](https://puppeteer.com/), [Make.com](https://make.com/)
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

```bash
git clone https://github.com/lilsouris/mot.du.jour.git
cd mot-du-jour
npm install
```

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# AI Providers
CLAUDE_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key

# Webhooks & Automation
WEBHOOK_SECRET=your_webhook_secret
MAKE_WEBHOOK_URL=your_make_webhook_url
CRON_SECRET=your_cron_secret
```

## Database Setup

The application uses Supabase as the database. The required tables are:

- `users` - User profiles and authentication
- `teams` - Team management for family plans
- `team_members` - Team membership relationships
- `activity_logs` - Activity tracking
- `invitations` - Team invitations
- `daily_message_logs` - SMS delivery tracking

Refer to `supabase_table_creation.sql` for the complete schema setup.

## Running Locally

1. Set up your Supabase project and database tables
2. Configure your environment variables
3. Install dependencies and run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## AI Message Generation

The application supports multiple AI providers with fallback mechanisms:

### Primary Providers

- **Claude API**: Direct API integration with Anthropic's Claude
- **OpenAI API**: GPT-4o-mini for message generation

### Fallback Providers

- **Claude Web Automation**: Puppeteer-based web scraping
- **Test Messages**: Pre-written fallback messages

### Message Generation Service

For production use, deploy the Claude automation service:

```bash
cd services
npm install
npm start
```

The service runs on port 3001 and provides automated message generation via web automation.

## Browser Extension

A Chrome extension is included for manual message generation:

1. Open Chrome Extensions (`chrome://extensions/`)
2. Enable Developer mode
3. Load the `browser-extension` folder
4. Use the extension to generate messages manually

## Daily Message Automation

The application includes a daily cron job that triggers at 7 AM UTC via Vercel:

- Fetches active users
- Generates personalized messages
- Delivers via SMS through Twilio
- Logs delivery status

## Testing Payments

Use Stripe's test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0000 0000 3220`

## Deployment

The application is configured for Vercel deployment with:

- Daily cron jobs for automated message delivery
- Webhook endpoints for Stripe integration
- Environment variable configuration
- Static asset optimization

### Production Setup

1. **Supabase**: Configure production database and auth
2. **Stripe**: Set up production webhooks and payment processing
3. **Twilio**: Configure SMS delivery service
4. **Make.com**: Set up automation workflows
5. **Vercel**: Deploy with environment variables

### Required Production Environment Variables

```env
# Add production values for all environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
STRIPE_SECRET_KEY=sk_live_...
CLAUDE_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
# ... and all other required variables
```

## Project Structure

```
mot-du-jour/
├── app/                          # Next.js 14 App Router
│   ├── (dashboard)/             # Protected dashboard routes
│   ├── api/                     # API routes and webhooks
│   ├── connection/              # Sign-in page
│   ├── inscription/             # Sign-up page
│   └── pricing/                 # Pricing page
├── browser-extension/           # Chrome extension for manual generation
├── components/                  # Reusable UI components
├── lib/                         # Utilities and configurations
│   ├── auth/                    # Authentication middleware
│   ├── payments/                # Stripe integration
│   └── supabase/                # Database client configurations
├── scripts/                     # Automation scripts
├── services/                    # External services (Claude automation)
└── public/                      # Static assets
```

## Key Features

### 🤖 AI-Powered Message Generation

- Multiple AI providers with intelligent fallbacks
- Personalized content based on user preferences
- Character limit optimization for SMS delivery
- French language specialization

### 📱 SMS Delivery System

- Daily automated message delivery
- Twilio integration for global SMS support
- Delivery status tracking and logging
- Phone number validation and formatting

### 💳 Subscription Management

- Stripe-powered payment processing
- Multiple subscription tiers (Personal, Family, Gift)
- 14-day free trial period
- Customer portal for self-service management

### 👥 Team & Family Plans

- Multi-user family subscriptions
- Team invitation system
- Role-based access control
- Shared subscription management

### 🔐 Security & Authentication

- Supabase Auth integration
- Row-level security policies
- Secure webhook validation
- Session management with JWTs

### 📊 Analytics & Logging

- Comprehensive activity tracking
- Message delivery analytics
- User engagement metrics
- System health monitoring

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support, email support@motdujour.com or create an issue in the GitHub repository.
