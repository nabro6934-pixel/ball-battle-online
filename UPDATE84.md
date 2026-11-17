# v84 — Native navigation and all-mode Bot Arena

- Removed the added home update hub/encyclopedia/settings/set buttons and update voting UI/API. Existing main five tabs remain.
- Mode selection now contains all six event modes, grouped with regular, friend/local and training choices.
- Collection contains character/set tabs; fighter details contain records and ultimate preview. Profile cosmetics contains lobby entrance equipment. Settings contains combat display and separate sound controls. History contains local replay navigation. Friend room rules and clan notices use native panels. Bug reports use the existing report entry with match context.
- Equipped lobby motion runs every 10 seconds while the unobstructed lobby is visible. Continuous character dance is disabled; reduced motion is respected.
- Bot Arena has 18 training choices including every regular/event/friend/local rule, tournament final, scalable free arena and target practice. Every slot supports any character and power 0–5; draft/relay expose round/pool choices. Teams follow the corresponding mode rules. Mirror shares the hero while allowing separate practice powers.
- Participant mode keeps automatic movement/basic attacks and manual own ultimate; observer mode automates ultimates. Countdown, pause, speed, restart, edit and local results are included. Training cannot call reward/match result APIs and is excluded from recorded competitive replays. No database migration is required.

Validation: `npm run test:update84` runs deterministic training/series/objective tests, natural match endings, real HTTP backend/asset tests, rendered DOM/canvas integration, ownership/claim idempotence and existing character/balance regression suites. DOM integration launches/draws all 18 training choices and checks no reward requests. This environment does not provide a working local Chromium renderer; pixel appearance is not claimed as browser-verified.
