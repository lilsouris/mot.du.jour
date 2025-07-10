# Random Daily Trigger Setup for Make.com (8 AM - 10 PM)

## Option 1: Daily Trigger + Random Delay (Simplest)

### Scenario Setup:
1. **Schedule Module**
   - Trigger: Every day at 8:00 AM
   - Timezone: Your target timezone

2. **Tools - Set Variable Module**
   - Variable name: `randomDelay`
   - Value: `{{floor(random * 50400)}}` 
   - (50400 seconds = 14 hours, from 8 AM to 10 PM)

3. **Tools - Sleep Module**
   - Delay in seconds: `{{1.randomDelay}}`

4. **Continue with your existing modules** (Get Users, Generate Messages, etc.)

### Pros:
- Simple to set up
- One scenario handles everything
- Reliable execution

### Cons:
- Make.com scenario runs for up to 14 hours
- Uses operations during the wait time

---

## Option 2: Multiple Daily Triggers with Random Selection

### Scenario Setup:
1. **Create 8 Schedule Modules** (parallel triggers):
   - 8:00 AM, 9:30 AM, 11:00 AM, 12:30 PM, 2:00 PM, 4:00 PM, 6:00 PM, 8:00 PM, 9:30 PM

2. **Router Module** with random condition:
   - Route 1: `{{floor(random * 9) = 0}}` (Execute - 11% chance)
   - Route 2: `{{floor(random * 9) != 0}}` (Stop execution)

3. **Tools - Set Variable** (to track daily execution):
   - Check if already executed today using Data Store

4. **Data Store - Search Records**:
   - Data store: `daily_executions`
   - Filter: `date = {{formatDate(now; "YYYY-MM-DD")}}`

5. **Router** (Check if already executed):
   - Route 1: No records found (Execute)
   - Route 2: Records found (Stop - already executed today)

6. **Continue with message sending logic**

7. **Data Store - Add Record** (Mark as executed):
   - Data store: `daily_executions`
   - Record: `{"date": "{{formatDate(now; "YYYY-MM-DD")}}", "executed_at": "{{now}}"}`

### Pros:
- True randomness
- No long-running scenarios
- Guaranteed single daily execution

### Cons:
- More complex setup
- Requires Data Store

---

## Option 3: External Cron + Make.com Webhook

### Step 1: Set up External Cron Service
Use a service like **EasyCron**, **cron-job.org**, or **GitHub Actions**:

#### EasyCron Setup:
1. Create account at easycron.com
2. Create new cron job:
   - **URL**: `https://your-domain.com/api/webhooks/random-daily-trigger`
   - **Schedule**: `0 8 * * *` (daily at 8 AM)
   - **Headers**: `Authorization: Bearer YOUR_WEBHOOK_SECRET`

#### GitHub Actions Setup (Free):
Create `.github/workflows/daily-trigger.yml`:

```yaml
name: Random Daily Message Trigger

on:
  schedule:
    - cron: '0 8 * * *'  # Daily at 8 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  trigger-random-message:
    runs-on: ubuntu-latest
    steps:
      - name: Calculate Random Time
        id: random_time
        run: |
          # Random seconds between 0 and 50400 (14 hours)
          RANDOM_SECONDS=$((RANDOM % 50400))
          echo "delay=$RANDOM_SECONDS" >> $GITHUB_OUTPUT
          
      - name: Sleep Random Time
        run: sleep ${{ steps.random_time.outputs.delay }}
        
      - name: Trigger Make.com Webhook
        run: |
          curl -X POST "${{ secrets.MAKE_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{"trigger_type": "random_daily", "executed_at": "'$(date -Iseconds)'"}'
```

### Step 2: Update Make.com Scenario
1. **Webhooks - Custom Webhook** (as first module)
   - This replaces the Schedule module
2. **Continue with existing logic**

### Pros:
- Free (GitHub Actions)
- True randomness
- No Make.com operation usage for delays
- External reliability

### Cons:
- Requires external service setup
- GitHub Actions has daily limits

---

## Option 4: Advanced Make.com with Time Calculation

### Most Sophisticated Make.com Solution:

1. **Schedule Module**: Daily at 12:01 AM

2. **Tools - Set Variable** (Calculate random time):
   - Variable: `randomHour`
   - Value: `{{floor(random * 14) + 8}}` (8-21, representing 8 AM to 9 PM)

3. **Tools - Set Variable** (Random minutes):
   - Variable: `randomMinute` 
   - Value: `{{floor(random * 60)}}` (0-59 minutes)

4. **Tools - Set Variable** (Target timestamp):
   - Variable: `targetTime`
   - Value: `{{setHour(setMinute(now; randomMinute); randomHour)}}`

5. **Tools - Set Variable** (Delay calculation):
   - Variable: `delaySeconds`
   - Value: `{{(targetTime - now) / 1000}}`

6. **Router** (Time validation):
   - Route 1: `{{delaySeconds > 0}}` (Future time - proceed)
   - Route 2: `{{delaySeconds <= 0}}` (Past time - stop or reschedule)

7. **Tools - Sleep**:
   - Delay: `{{delaySeconds}}` seconds

8. **Continue with message logic**

---

## Recommended Approach

**For Simplicity**: Use **Option 1** (Daily trigger + random delay)

**For Efficiency**: Use **Option 3** (External cron + webhook)

**For Make.com Only**: Use **Option 2** (Multiple triggers + Data Store)

## Additional Environment Variables

Add to your `.env` file:

```env
# Make.com webhook URL (get from Make.com scenario)
MAKE_WEBHOOK_URL=https://hook.eu1.make.com/your-webhook-url-here

# Optional: If using external services
EASYCRON_API_KEY=your_easycron_api_key_here
```

## Testing Random Triggers

### Test Random Time Generation:
```javascript
// Test in Make.com Functions module
const randomHour = Math.floor(Math.random() * 14) + 8; // 8-21 (8 AM to 9 PM)
const randomMinute = Math.floor(Math.random() * 60);  // 0-59
const randomTime = `${randomHour}:${randomMinute.toString().padStart(2, '0')}`;
console.log(`Random execution time: ${randomTime}`);
```

### Monitor Execution Times:
Create a simple tracking webhook to log actual execution times and verify randomness over time.

Choose the option that best fits your technical comfort level and Make.com operation budget!