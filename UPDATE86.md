# v86 — Restore original battle and Bot Arena screens

- The original lobby idle dance remains active. Equipped entrance motion still runs separately every 10 seconds and then returns to the idle animation.
- Disable the lobby-wide theme stylesheet outside the home screen. This restores the underlying original battle panel/header/footer, aim HUD, ultimate controls, matchmaking, selection, countdown and result styling rather than merely changing canvas decoration.
- Stop redirecting the original Bot Arena/1v1 setup functions to the v84 replacement. The existing roster grid, count presets, random/all-character tools, original spectator HUD, standings, countdown and controls are used again. All-mode training remains available as a separate third tab.
- Normal combat calls the original battle renderer without v82 damage regrouping, extra overlays or result annotations. Objective indicators are limited to new event modes. Removed preview links inserted into existing pick cards; previews remain in character details.
- Preserve all character mechanics, target-practice HP fix, modes, rewards and account data.

Validation: rendered DOM tests assert original bot controls are present, replacement setup is absent, training tab exists, battle theme stylesheet is disabled during bot/training screens and restored on the home screen. Existing target damage/respawn and all-mode regression tests remain in place. Pixel-level local Chromium rendering is unavailable in this environment.
