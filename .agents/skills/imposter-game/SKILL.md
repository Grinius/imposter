---
name: imposter-game
description: Implement or debug Imposter game rules, round transitions, secret delivery, private multiplayer rooms, reconnect behavior, and gameplay tests in this repository.
---

# Imposter game engineering

Read `docs/PROJECT.md` and `docs/ARCHITECTURE.md` from the repository root. Inspect actual implementation before adopting the proposed architecture.

Specify the affected rule before coding: who may act, in which phase, which data each player may see, and what happens on invalid or repeated actions. Keep domain transitions independent of animation and transport. Inject controlled randomness for tests; avoid predictable role assignment in production.

For pass-phone play, hide private content before handing the device over and prevent interaction carryover from exposing the next card. For multiplayer, build per-player server projections; hiding a secret in CSS does not protect it. Authorize player actions independently of room discovery codes. Validate phase/round IDs and make retries safe.

Exercise realistic failures relevant to the change: stale votes, simultaneous actions, refresh, reconnect, host departure, and replay reset. Test both allowed transitions and rejected ones. Use separate clients to verify actual data visibility. Clearly distinguish local simulation from implemented network play.

Record exact rule choices and tested behavior in the project documents. Do not silently introduce alternate words, AI bots, public matchmaking, or new win conditions.
