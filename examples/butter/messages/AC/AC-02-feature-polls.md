---
id: AC-02
stage: AC
classification: lifecycle
name: "Get instant feedback with polls"
trigger:
  event: user.email_verified
  type: event
wait: "P4D"
guards:
  - condition: "User has not cancelled"
    expression: "user.plan != 'cancelled'"
suppressions:
  - condition: "User already used the polls feature"
    expression: "feature.polls_used == true"
channels: [email, in-app]
cta:
  text: "Try a poll in your next session"
  url: "/app/sessions?feature=polls"
segment: Everyone
tags: [type:educational, feature:polls]
format: rich
from: "Anja, Head of Product"
subject: "No more asking 'Any questions?' to silence"
preheader: "Live polls make every session interactive"
goal: "Drive first use of the polls feature"
comments: "Second activation message. Polls are the most visible 'wow' feature for participants."
---

## Email

**Subject:** No more asking "Any questions?" to silence
**Preheader:** Live polls make every session interactive

Hey {{first_name}},

You know that awkward moment when you ask "Any thoughts?" and get... nothing? Crickets. Tumbleweeds.

Butter's live polls fix that. Launch a poll mid-session and watch responses roll in instantly. It works because people are way more willing to click a button than unmute themselves.

A few ways to use them:
- **Icebreakers** — "What's your energy level?" to kick things off
- **Check-ins** — "Is this pace working?" halfway through
- **Decision making** — "Which option do we go with?" to move forward
- **Quizzes** — Test knowledge in training sessions

Results show up live on screen, so everyone sees the group's input in real time.

**[Try a poll in your next session →]({{app_url}}/sessions?feature=polls)**

Trust us — once you use polls, you'll wonder how you ran sessions without them.

Cheers,
Anja

---

## In-App

**Title:** Make your sessions interactive with polls
**Body:** Launch a live poll and get instant responses from your participants. Great for icebreakers, check-ins, and group decisions.
**CTA:** Try polls
