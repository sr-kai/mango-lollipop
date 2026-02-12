---
id: TX-01
stage: TX
classification: transactional
name: "Verify your email"
trigger:
  event: user.signed_up
  type: event
wait: "P0D"
guards: []
suppressions: []
channels: [email]
cta:
  text: "Verify my email"
  url: "/verify?token={{verification_token}}"
segment: Everyone
tags: [type:transactional]
format: plain
from: "Butter Team"
subject: "Verify your Butter account"
preheader: "One click and you're in"
goal: "Email verification to activate account"
comments: "Transactional — sent immediately on signup. Do not suppress or delay."
---

## Email

**Subject:** Verify your Butter account
**Preheader:** One click and you're in

Hey {{first_name}},

Welcome to Butter! To get started, please verify your email address.

**[Verify my email →]({{verification_url}})**

This link expires in 24 hours. If you didn't create a Butter account, you can safely ignore this email.

— The Butter Team
