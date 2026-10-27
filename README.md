# Coffee Track ☕

An offline Android café game in English. Match customer orders, serve quickly and build a streak during a 90-second shift.

## Play

Tap a customer card. Add the exact items shown on the order to your tray, then tap **Serve order**. Duplicate items count. Tap a tray item to remove it or use **Clear tray**. The pause button freezes customer patience and the shift clock. Leaving the app automatically pauses the game.

- Correct order: **+100**.
- Served before half the patience runs out: **+50** speed bonus.
- Consecutive correct orders: **+10 per additional order**, capped at **+50** extra.
- Wrong order: **−30**, resets streak; customer stays.
- Customer leaves: **−50 and one heart**, resets streak.
- Score never goes below zero. Three lost customers or 90 seconds ends the shift.
- Best score is stored locally when device storage is available.

The six menu items are coffee, tea, croissant, sandwich, cake and cookie. Eight customer appearances, a striped café awning, indoor plants, window, patience bars and serving tray establish the café setting. Orders become larger and arrive faster as more customers are served.

## Get the Android APK

Open **Actions → Build Coffee Track APK**, select a successful run, and download **Coffee-Track-APK** under Artifacts. Extract and install `app-debug.apk`. This is an educational debug build, not a signed Play Store release. A different debug signature may require uninstalling a previous copy, clearing its local best score.

Every push runs game-rule tests and Android build/lint, then runs the actual APK in an Android emulator. The **Coffee-Track-Android-Evidence** artifact contains a 45-second MP4, Android screenshots and instrumentation output. Check the job result and instrumentation report before treating them as successful evidence.

## Local development

Java 17, Android SDK 35, Build Tools 35.0.0, Gradle 8.9 (checksum-pinned wrapper), Node.js 22+ for tests.

```sh
node tests/engine.test.js
bash gradlew --no-daemon --max-workers=2 assembleDebug lintDebug assembleDebugAndroidTest
```

APK: `app/build/outputs/apk/debug/app-debug.apk`.

For web iteration, serve `app/src/main/assets` with a static server. No package installation or Internet connection is required to play. The Android wrapper serves bundled assets from a dedicated HTTPS origin, has no Internet permission, blocks navigation away, and exposes no native JavaScript bridge.

Browser smoke test: install Playwright locally, start a static server on port 4173 and run `node tests/browser-smoke.cjs` (requires Chromium at `/usr/bin/chromium`; override the URL with `COFFEE_URL`).

## Submission checklist

1. Add your public repository link to the Word document.
2. Open a genuinely successful GitHub Actions run and screenshot its green check. Local build logs do not replace this.
3. Download the Android evidence artifact. Watch the MP4, upload it to YouTube as unlisted, and insert the link in Word. If recording fails, use the real Android emulator screenshots instead, following the assignment's reduced-credit option.
4. Add short explanations of food diversity, scoring and visual design.
5. Submit the completed Word file to LMS.

`evidence/` contains mobile-sized **browser** screenshots from development; these are not Android emulator screenshots. Actual Android execution and GitHub green-check evidence must be obtained from a successful workflow run. `submission/Coffee-Track-Submission-DRAFT.docx` is an incomplete draft until the required links and genuine evidence are inserted.
