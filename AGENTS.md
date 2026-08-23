# Browser Testing

For changes affecting web UI, routing, interaction, responsiveness, or runtime behavior, perform real browser verification before declaring completion.

Use the most appropriate tool:

- **Browser plugin** — preferred for routine localhost checks, navigation, visual inspection, and exploratory testing.
- **Playwright** — use for repeatable E2E flows, regression tests, assertions, and important user paths.
- **Chrome plugin** — use when the real Chrome profile, cookies, sessions, extensions, or logged-in state are required.
- **Chrome DevTools** — use for console, network, rendering, memory, scrolling, or performance diagnosis.
- **Computer Use** — use only when native OS interaction is required.

Prefer real user flows over injected state, modified storage, hidden routes, or DOM manipulation.

When relevant, verify the affected flow, routing/refresh behavior, representative desktop and mobile sizes, console errors, failed resources, and the deployed site when localhost may differ from production.

A successful build or passing unit tests do not prove browser behavior is correct.

If a bug is found, reproduce it, fix the root cause, and rerun the failing path. Add a Playwright regression test when recurrence would be costly.

Keep testing proportional to risk; do not run every browser tool unnecessarily.

Never claim browser verification passed unless the required flow was actually executed successfully.
