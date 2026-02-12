---
id: AC-03
stage: AC
classification: lifecycle
name: "Breakout rooms that actually work"
trigger:
  event: user.email_verified
  type: event
wait: "P7D"
guards:
  - condition: "User has not cancelled"
    expression: "user.plan != 'cancelled'"
suppressions:
  - condition: "User already used the breakout rooms feature"
    expression: "feature.breakouts_used == true"
channels: [email, in-app]
cta:
  text: "Set up breakout rooms"
  url: "/app/sessions?feature=breakouts"
segment: Everyone
tags: [type:educational, feature:breakouts]
format: rich
from: "Anja, Head of Product"
subject: "Breakout rooms that don't make people groan"
preheader: "Small group work, without the chaos"
goal: "Drive first use of breakout rooms"
comments: "Third activation message. Breakouts complete the core facilitation trifecta (agenda + polls + breakouts = aha moment)."
---

## Email

**Subject:** Breakout rooms that don't make people groan
**Preheader:** Small group work, without the chaos

Hey {{first_name}},

Let's be honest — breakout rooms on most platforms are painful. People get lost, nobody knows what to do, and half the time someone's stuck in the wrong room.

We rebuilt breakouts from scratch to fix all of that:

- **Pre-assign or auto-shuffle** — You decide how groups form
- **Broadcast messages** — Send instructions to all rooms at once
- **Timer visible in every room** — Everyone knows how long they have
- **One-click return** — Bring everyone back instantly, no stragglers

The best part? You can plan breakouts right in your agenda, so the whole session flows seamlessly.

**[Set up breakout rooms →]({{app_url}}/sessions?feature=breakouts)**

If you've already set up an agenda, adding breakouts takes about 30 seconds.

Cheers,
Anja

---

## In-App

**Title:** Ready to try breakout rooms?
**Body:** Split participants into small groups with pre-set instructions, timers, and one-click return. Plan them right in your agenda.
**CTA:** Set up breakouts
