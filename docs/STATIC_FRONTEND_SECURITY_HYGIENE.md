# Track.Lab Static Frontend Security & Hygiene Policy

This document states the permanent frontend security constraints and architectural guidelines implemented within the Track.Lab application suite.

## 1. Zero External API Calls for Calculations
Track.Lab does not rely on third-party cloud engines to generate, scale, or process running metrics. 
- No `fetch(`, `axios`, or `XMLHttpRequest` targets are allowed to transmit user inputs or metrics.
- No `WebSocket` connections are maintained.
- Calculations remain 100% local, executed in real-time within browser memory.

## 2. No Background Telemetry or Tracking Pixels
To safeguard athlete data privacy:
- No telemetry SDKs (such as Sentry, LogRocket, or Mixpanel) are loaded.
- No performance tracking beacons (`navigator.sendBeacon`) are active.
- There are no analytics libraries or cookies designed to build visitor profiles.

## 3. Sandboxed Browser State (No Storage)
- **Zero LocalStorage Logs**: Track.Lab does not persist workout summaries, split histories, shoe models, or physiological thresholds into the browser's `localStorage`, `sessionStorage`, or `indexedDB` blocks.
- **Immediate Volatility**: All active variables remain strictly inside the local React component state hierarchy. Closing, navigating away, or reloading the webpage cleanly flushes all inputs and results.
- **Local Storage is Restricted ONLY to Interface Preferences**: Reading or writing to browser storage is only allowed for saving aesthetic UI preference toggles (such as system dark-mode transitions, if explicitly added). It is never used for athlete measurements.

## 4. Execution Safety & Anti-Injection Rules
The running calculations rely on rigorous, deterministic mathematical formula maps rather than string compiler processes:
- **No String Compilation**: Under no circumstances is user-entered text compiled using `eval()` or `new Function()`.
- **Display-Only Math Text**: Formula strings imported from the static Phase 13 JSON metadata registry are parsed and rendered as raw, read-only text in standard `<span />` tags or code-formatted blocks. They are never parsed into live actions.
- **Pure Document Safety**: Raw HTML injection surfaces like `dangerouslySetInnerHTML` or `innerHTML` properties are completely restricted, preventing any possible DOM security exploits.

## 5. Explicit Security Headers Configuration
The application is wrapped with a defensive standard configuration inside `next.config.ts`, returning secure static HTTP response headers to prevent iframe and data leaks:
- `X-Content-Type-Options: nosniff` (Halts MIME-type manipulation)
- `Referrer-Policy: strict-origin-when-cross-origin` (Reduces referrer exposure during outgoing navigations)
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()` (Deactivates external iframe hardware capture)
- `X-Frame-Options: DENY` (Mitigates tapjacking/clickjacking risk inside unauthorized websites)
