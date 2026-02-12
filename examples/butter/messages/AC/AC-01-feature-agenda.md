---
id: AC-01
stage: AC
classification: lifecycle
name: "Master your agenda in 2 minutes"
trigger:
  event: user.email_verified
  type: event
wait: "P2D"
guards:
  - condition: "User has not cancelled"
    expression: "user.plan != 'cancelled'"
suppressions:
  - condition: "User already used the agenda feature"
    expression: "feature.agenda_used == true"
channels: [email, in-app]
cta:
  text: "Set up your first agenda"
  url: "/app/agenda/new"
segment: Everyone
tags: [type:educational, feature:agenda, priority:high]
format: rich
from: "Anja, Head of Product"
subject: "Master your agenda in 2 minutes, {{first_name}}"
preheader: "Your sessions are about to get way smoother"
goal: "Drive first use of the agenda feature"
comments: "First activation message. Agenda is the easiest feature to try and sets up the workflow for polls/breakouts."
---

## Email

**Subject:** Master your agenda in 2 minutes, {{first_name}}
**Preheader:** Your sessions are about to get way smoother

Hey {{first_name}},

Ever walked into a session without a plan and felt that moment of panic? We've all been there.

With Butter's agenda feature, you can plan your entire session flow before you start — breakouts, polls, timers, all set up and ready to go.

Here's the 2-minute version:
1. Open your upcoming session
2. Click "Agenda" in the sidebar
3. Drag in your activities

That's it. Your participants will see a clear flow, and you'll never lose track of time again.

**[Set up your first agenda →]({{app_url}}/agenda/new)**

Pro tip: You can save agenda templates for sessions you run regularly. Set it up once, reuse forever.

Cheers,
Anja

---

## In-App

**Title:** Ready to plan your session flow?
**Body:** Set up your agenda in under 2 minutes — drag in activities, set timers, and your participants will see a clear flow. No more winging it.
**CTA:** Create agenda
