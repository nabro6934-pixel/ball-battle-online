# v85 — Restore established UI and readable target HP

- Existing mode selector grid and original settings content/order are restored. New combat settings are in an optional collapsed section after existing settings.
- Removed the v82 combat decoration overlays and projectile/character rings. Existing attack art, health bars, battle renderer and native ultimate controls are retained; event-specific objectives/walls remain necessary for new modes.
- Training uses the original battlefield renderer and native ultimate dock with the correct training engine callback. Auxiliary training controls sit beneath the battlefield in the existing footer style.
- Only new screens/components receive the established blue panel/button palette; base lobby, cosmetics, main navigation and battle CSS are not rewritten.
- Target practice uses the selected target's normal level-adjusted HP rather than 100,000 HP. Actual attack damage visibly reduces its health fraction; defeated targets respawn and no real rewards are granted.

Validation: complete existing update84 regression suite, all 18 training launches/draws in rendered DOM/canvas integration, native ultimate dock, and real target melee damage plus respawn. Local pixel rendering remains unavailable in this environment.
