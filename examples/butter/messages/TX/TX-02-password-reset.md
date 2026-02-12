---
id: TX-02
stage: TX
classification: transactional
name: "Password reset"
trigger:
  event: user.password_reset_requested
  type: event
wait: "P0D"
guards: []
suppressions: []
channels: [email]
cta:
  text: "Reset my password"
  url: "/reset-password?token={{reset_token}}"
segment: Everyone
tags: [type:transactional]
format: plain
from: "Butter Team"
subject: "Reset your Butter password"
preheader: "You requested a password reset"
goal: "Allow users to regain account access securely"
comments: "Transactional — sent immediately. Link expires in 1 hour."
---

## Email

**Subject:** Reset your Butter password
**Preheader:** You requested a password reset

Hey {{first_name}},

We received a request to reset your Butter password. Click the button below to choose a new one.

**[Reset my password →]({{reset_url}})**

This link expires in 1 hour. If you didn't request this, no action is needed — your password hasn't changed.

— The Butter Team
