# Daily Mental Health Messages - Make.com Automation Setup Guide

## Overview
This guide explains how to set up a Make.com automation that sends daily mental health messages to active users via SMS using OpenAI for message generation and Twilio for SMS delivery.

## Prerequisites
1. **Make.com account** with sufficient operations
2. **OpenAI API key** for message generation
3. **Twilio account** with SMS capabilities
4. **Webhook secret** for securing API calls
5. **Supabase database** with the daily_message_logs table created

## Make.com Scenario Setup

### Module 1: Schedule Trigger
- **Module**: Schedule
- **Settings**: 
  - Run daily at 9:00 AM (or preferred time)
  - Timezone: Set to your target audience timezone

### Module 2: Get Active Users
- **Module**: HTTP - Make a Request
- **Settings**:
  - URL: `https://your-domain.com/api/webhooks/get-active-users`
  - Method: POST
  - Headers:
    - `Authorization`: `Bearer YOUR_WEBHOOK_SECRET`
    - `Content-Type`: `application/json`
- **Output**: Array of active users with phone numbers

### Module 3: Iterator
- **Module**: Flow Control - Iterator
- **Settings**:
  - Array: `{{2.users}}` (from Get Active Users response)
- **Purpose**: Process each user individually

### Module 4: Generate Mental Health Message
- **Module**: OpenAI - Create a Chat Completion
- **Settings**:
  - Model: `gpt-4` or `gpt-3.5-turbo`
  - Messages:
    ```json
    [
      {
        "role": "system",
        "content": "You are a compassionate mental health assistant. Generate a short, positive, encouraging daily message in French (50-150 characters) focused on mental wellbeing, mindfulness, or positivity. The message should be personal, uplifting, and appropriate for SMS. Avoid generic platitudes."
      },
      {
        "role": "user", 
        "content": "Generate a unique daily mental health message for someone subscribed to daily wellness texts."
      }
    ]
    ```
  - Max tokens: 100
  - Temperature: 0.8

### Module 5: Check Message History
- **Module**: HTTP - Make a Request
- **Settings**:
  - URL: `https://your-domain.com/api/webhooks/check-message-history`
  - Method: POST
  - Headers:
    - `Authorization`: `Bearer YOUR_WEBHOOK_SECRET`
    - `Content-Type`: `application/json`
  - Body:
    ```json
    {
      "user_id": "{{3.user_id}}",
      "message_content": "{{4.choices[].message.content}}"
    }
    ```

### Module 6: Router (Message Exists Check)
- **Module**: Flow Control - Router
- **Routes**:
  - **Route 1**: Message exists (`{{5.message_exists}} = true`)
  - **Route 2**: Message is new (`{{5.message_exists}} = false`)

### Route 1: Message Already Sent
#### Module 6A: Generate New Message (Retry)
- **Module**: OpenAI - Create a Chat Completion
- **Settings**: Same as Module 4, but with added instruction:
  - Add to system message: "Generate a completely different message from previous ones. Be creative and unique."

#### Module 6B: Check New Message History
- **Module**: HTTP - Make a Request
- **Settings**: Same as Module 5, but using new message content
- **Note**: You may want to add a filter to limit retries (max 3 attempts)

#### Module 6C: Router for Retry Check
- **Module**: Flow Control - Router
- Continue similar pattern until unique message found

### Route 2: Send New Message
#### Module 7: Send SMS via Twilio
- **Module**: Twilio - Send an SMS Message
- **Settings**:
  - From: `YOUR_TWILIO_PHONE_NUMBER`
  - To: `{{3.phone_number}}`
  - Body: `{{4.choices[].message.content}}`

#### Module 8: Log Successful Message
- **Module**: HTTP - Make a Request
- **Settings**:
  - URL: `https://your-domain.com/api/webhooks/log-sent-message`
  - Method: POST
  - Headers:
    - `Authorization`: `Bearer YOUR_WEBHOOK_SECRET`
    - `Content-Type`: `application/json`
  - Body:
    ```json
    {
      "user_id": "{{3.user_id}}",
      "phone_number": "{{3.phone_number}}",
      "message_content": "{{4.choices[].message.content}}",
      "status": "sent",
      "twilio_sid": "{{7.sid}}"
    }
    ```

### Error Handling
#### Module 9: Error Handler (for Twilio failures)
- **Module**: Tools - Set Variable
- **Purpose**: Catch Twilio SMS failures
- **Follow with**: Log Failed Message

#### Module 10: Log Failed Message
- **Module**: HTTP - Make a Request
- **Settings**: Same as Module 8, but with:
  ```json
  {
    "status": "failed",
    "error_message": "{{error_description}}"
  }
  ```

## Environment Variables Setup

Update your `.env` file with:
```env
# Webhook Secret for Make.com automation
WEBHOOK_SECRET=generate_a_strong_random_string_here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Supabase Setup

1. Run the SQL script in `supabase_table_creation.sql` in your Supabase SQL Editor
2. Ensure RLS policies are properly configured
3. Verify the table structure matches the TypeScript types

## Testing the Setup

### 1. Test Individual Webhooks
```bash
# Test get active users
curl -X POST https://your-domain.com/api/webhooks/get-active-users \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json"

# Test message history check
curl -X POST https://your-domain.com/api/webhooks/check-message-history \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test-user-id", "message_content": "Test message"}'

# Test message logging
curl -X POST https://your-domain.com/api/webhooks/log-sent-message \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-id",
    "phone_number": "+33123456789",
    "message_content": "Test message",
    "status": "sent"
  }'
```

### 2. Test Make.com Scenario
1. Create a test scenario with a single user
2. Run manually to verify all modules work
3. Check Supabase logs to verify data is being stored
4. Verify SMS delivery through Twilio

## Monitoring and Maintenance

### 1. Make.com Monitoring
- Set up email notifications for scenario failures
- Monitor operation usage
- Review execution logs regularly

### 2. Database Monitoring
- Query daily_message_logs table for delivery statistics
- Monitor for failed messages
- Check for users receiving duplicate messages

### 3. Message Quality
- Periodically review generated messages for quality
- Adjust OpenAI prompts based on user feedback
- Monitor message uniqueness across users

## Security Best Practices

1. **Webhook Security**: Always verify the Authorization header
2. **Rate Limiting**: Consider implementing rate limiting on webhooks
3. **Error Handling**: Never expose sensitive information in error messages
4. **Logging**: Log all operations but avoid logging sensitive data
5. **API Keys**: Regularly rotate API keys and secrets

## Troubleshooting

### Common Issues:
1. **Webhook 401 Errors**: Check WEBHOOK_SECRET environment variable
2. **No Users Returned**: Verify users have active subscriptions and phone numbers
3. **Duplicate Messages**: Check message history logic and hash generation
4. **SMS Failures**: Verify Twilio credentials and phone number format
5. **OpenAI Errors**: Check API key and rate limits

### Debug Steps:
1. Test each webhook endpoint individually
2. Check Make.com execution logs
3. Verify Supabase table data
4. Review server logs for errors
5. Test with a single user first

## Scaling Considerations

1. **Rate Limits**: 
   - OpenAI: Respect token limits and rate limits
   - Twilio: Consider message sending rate limits
   - Make.com: Monitor operation usage

2. **Database Performance**: 
   - Monitor query performance
   - Consider archiving old message logs
   - Optimize indexes as needed

3. **Cost Management**:
   - Monitor OpenAI token usage
   - Track Twilio SMS costs
   - Optimize Make.com operations

## Future Enhancements

1. **Personalization**: Use user preferences for message themes
2. **Scheduling**: Allow users to choose their preferred time
3. **Analytics**: Track message engagement and user feedback
4. **A/B Testing**: Test different message styles and timing
5. **Multi-language**: Support for different languages based on user preference