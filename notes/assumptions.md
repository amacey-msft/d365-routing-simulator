# Assumptions

1. **Existing environment**: The lab targets an existing Power Platform environment with Dynamics 365 Contact Center provisioned. We do not create or provision new environments.
2. **Licensing**: The target environment already has Dynamics 365 Customer Service Enterprise or Contact Center licenses applied.
3. **Unified Routing**: May need to be enabled as part of the lab (Step 001). Some environments may already have it enabled.
4. **Admin access**: The user executing the lab has System Administrator or Omnichannel Administrator security role.
5. **Chat channel**: The lab uses the Chat channel (live chat widget). Voice, SMS, and social channels are out of scope for the core lab.
6. **Email routing**: Optional module — only included if present in the baseline reference and supported by official docs.
7. **Sentiment routing**: Optional module — same criteria as email.
8. **Authentication mode**: Playwright tests support interactive sign-in or `storageState` reuse. No service principal / headless auth for Power Platform admin portals.
9. **Locale**: Default `en-US`. UI labels may vary by locale or environment version.
10. **Screenshots**: Captured at 1440×900 viewport from a Chromium browser via Playwright.
