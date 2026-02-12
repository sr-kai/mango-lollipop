---
id: RT-02
stage: RT
classification: lifecycle
name: "We noticed you've been quiet"
trigger:
  event: user.inactive_3_days
  type: behavioral
wait: "P0D"
guards:
  - condition: "User has completed at least one session"
    expression: "user.sessions_completed >= 1"
suppressions:
  - condition: "User has unsubscribed"
    expression: "user.unsubscribed == true"
  - condition: "User logged in within the last 24 hours"
    expression: "user.last_active < 24h_ago == false"
channels: [email, in-app]
cta:
  text: "Schedule a session"
  url: "/app/sessions/new"
segment: Dormant users (3+ days inactive)
tags: [type:behavioral, segment:dormant]
format: plain
from: "Butter Team"
subject: "Got a session coming up, {{first_name}}?"
preheader: "A quick nudge from your friends at Butter"
goal: "Re-engage users before they drift away"
comments: "Soft re-engagement. Friendly tone, no guilt. Only sent to users who have completed at least one session."
---

## Email

**Subject:** Got a session coming up, {{first_name}}?
**Preheader:** A quick nudge from your friends at Butter

Hey {{first_name}},

Just checking in — it's been a few days since your last Butter session. No pressure at all, but if you've got a meeting or workshop coming up, here are a few things you can prep in advance:

- **Set up your agenda** so the session runs itself
- **Pre-load poll questions** for instant audience engagement
- **Configure breakout rooms** before anyone joins

Having everything ready before you go live makes a huge difference. Your participants will notice.

**[Schedule a session →]({{app_url}}/sessions/new)**

If you're all set for now, we'll be here when you need us.

— The Butter Team

---

## In-App

**Title:** Got an upcoming session?
**Body:** Prep your next workshop or meeting in advance — set up your agenda, polls, and breakout rooms so everything's ready when you go live.
**CTA:** Schedule a session
