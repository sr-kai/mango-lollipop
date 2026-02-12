---
id: RT-01
stage: RT
classification: lifecycle
name: "Your weekly session recap"
trigger:
  event: usage.weekly_summary
  type: scheduled
  schedule: "every friday 9am"
wait: "P0D"
guards:
  - condition: "User has run at least one session this week"
    expression: "user.sessions_this_week >= 1"
suppressions:
  - condition: "User has unsubscribed from recap emails"
    expression: "user.unsubscribed_recaps == true"
channels: [email]
cta:
  text: "View session details"
  url: "/app/sessions/history"
segment: Active users
tags: [type:behavioral, segment:active]
format: rich
from: "Butter Team"
subject: "Your week on Butter: {{sessions_count}} session{{sessions_plural}}"
preheader: "Here's what you accomplished this week"
goal: "Reinforce value, build habit, surface unused features"
comments: "Sent every Friday at 9am. Only sent if user ran at least 1 session. Includes stats and a feature nudge."
---

## Email

**Subject:** Your week on Butter: {{sessions_count}} session{{sessions_plural}}
**Preheader:** Here's what you accomplished this week

Hey {{first_name}},

Here's your Butter recap for the week:

**Sessions run:** {{sessions_count}}
**Total participants:** {{total_participants}}
**Time facilitated:** {{total_minutes}} minutes

{{#if polls_count}}You launched **{{polls_count}} polls** — your participants definitely weren't snoozing.{{/if}}
{{#if breakouts_count}}You ran **{{breakouts_count}} breakout sessions** across your meetings.{{/if}}

{{#unless feature.recording_used}}
**Have you tried recordings?** Record your sessions and share replays with anyone who couldn't attend. It's a Pro feature worth checking out.
{{/unless}}

**[View session details →]({{app_url}}/sessions/history)**

Have a great weekend,
The Butter Team
