---
id: RF-01
stage: RF
classification: lifecycle
name: "Invite your team to Butter"
trigger:
  event: milestone.first_success
  type: event
wait: "P1D"
guards:
  - condition: "User has not already invited teammates"
    expression: "user.teammates_invited == 0"
suppressions:
  - condition: "User already has teammates on account"
    expression: "user.team_size > 1"
channels: [email, in-app]
cta:
  text: "Invite your team"
  url: "/app/team/invite"
segment: Solo users who completed first session
tags: [type:promotional, segment:active]
format: rich
from: "Jakob, Co-founder"
subject: "Your first session went great — bring your team along?"
preheader: "Butter's better with your whole crew"
goal: "Drive team invitations to increase account stickiness and expand usage"
comments: "Sent 1 day after first successful session completion. Only to users who haven't invited anyone yet."
---

## Email

**Subject:** Your first session went great — bring your team along?
**Preheader:** Butter's better with your whole crew

Hey {{first_name}},

Congrats on running your first Butter session! Hope it went well.

Here's something we've seen work really well: when teams use Butter together, everyone levels up. Shared agenda templates, consistent session formats, and your whole crew running more engaging meetings.

You can invite teammates in about 10 seconds:

**[Invite your team →]({{app_url}}/team/invite)**

They'll get their own account and can start creating sessions right away. Free plan users can invite up to 3 teammates.

If you're the only facilitator on your team, no worries — Butter works great solo too.

Cheers,
Jakob

---

## In-App

**Title:** Bring your team to Butter
**Body:** Your first session is done! Invite teammates to share templates, collaborate on agendas, and run better sessions across your whole team.
**CTA:** Invite teammates
