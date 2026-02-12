---
id: AQ-01
stage: AQ
classification: lifecycle
name: "Welcome to Butter"
trigger:
  event: user.email_verified
  type: event
wait: "PT5M"
guards: []
suppressions: []
channels: [email, in-app]
cta:
  text: "Create your first session"
  url: "/app/sessions/new"
segment: Everyone
tags: [type:educational, segment:new]
format: rich
from: "Jakob, Co-founder"
subject: "Welcome to Butter, {{first_name}}!"
preheader: "Your sessions are about to level up"
goal: "Orient new users and drive first session creation"
comments: "Sent 5 minutes after email verification. Sets the tone for the onboarding journey."
---

## Email

**Subject:** Welcome to Butter, {{first_name}}!
**Preheader:** Your sessions are about to level up

Hey {{first_name}},

I'm Jakob, one of the co-founders of Butter. Really glad you're here.

We built Butter because we got tired of running workshops on tools that weren't designed for facilitation. Awkward silences, clunky screen shares, participants checking their phones — sound familiar?

Butter gives you everything you need to run sessions people actually enjoy:

- **Agenda builder** — Plan your flow, keep things on track
- **Live polls** — Get instant feedback, no third-party tools
- **Breakout rooms** — Small group work, done right
- **Timer** — Pace yourself without constantly checking the clock

The best way to see what Butter can do? Run your first session.

**[Create your first session →]({{app_url}}/sessions/new)**

It takes about 2 minutes to set up. And if you need help, just reply to this email — it goes straight to our team.

Happy facilitating,
Jakob

---

## In-App

**Title:** Welcome to Butter! Ready to run your first session?
**Body:** Set up your first session in about 2 minutes. Add an agenda, invite participants, and see what interactive facilitation feels like.
**CTA:** Create your first session
