# Acceptance criteria

Apply the checks relevant to each change. These are intended acceptance criteria, not completed test results.

## Playable release

- Complete setup through replay without dead ends; explain rules before requiring a consequential action.
- Specify and test role assignment, allowed transitions, voting, ties, final guess behavior, and new-round reset.
- Pass-phone reveal requires deliberate interaction; hiding shows a neutral handoff screen. Back navigation or animation must not accidentally reveal another player's card.
- For online play, exercise separate browser contexts; verify private payloads, unauthorized actions, duplicate votes, reconnect, host departure, and expired rooms.

## Visual and accessibility

- Inspect narrow mobile, tablet, and desktop layouts in a browser, including long names and full rooms.
- Check loading, empty, error, disconnected, and result states, not just the landing screen.
- Maintain readable type and contrast, keyboard navigation, visible focus, labeled controls, and practical touch targets. Do not rely on color alone for roles/results.
- Respect reduced motion. Audio starts only after user interaction and has a mute control. Preserve core play when decorative WebGL is unavailable.
- Optimize original/licensed art and record source/license or generation provenance when adding assets.

## Engineering and search

Run configured lint, type checks, relevant unit/integration tests, and production build. Add browser tests for high-value flows when the app exists. Inspect console errors and production-rendered public HTML. Check metadata, canonical URLs, sitemap, private-route indexing directives, and realistic mobile performance. Record what was actually run and any limits.

Before public launch, verify domain/hosting configuration, basic error visibility, room cleanup, and any enabled analytics or monetization requirements. Do not activate unrequested paid services.
