#!/usr/bin/env bash
set -euo pipefail
mkdir -p android-evidence
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb install -r app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
adb shell screenrecord --time-limit 45 /sdcard/coffee-track.mp4 &
recorder=$!
adb shell am instrument -w com.coffeetrack.game.test/com.coffeetrack.game.GameSmokeInstrumentation > android-evidence/instrumentation.txt &
test_process=$!
sleep 7
adb exec-out screencap -p > android-evidence/01-game.png
sleep 8
adb exec-out screencap -p > android-evidence/02-serving.png
wait "$test_process"
adb exec-out screencap -p > android-evidence/03-score.png
wait "$recorder" || true
adb pull /sdcard/coffee-track.mp4 android-evidence/coffee-track.mp4
if ! rg -q 'PASS: real Android WebView' android-evidence/instrumentation.txt; then
  cat android-evidence/instrumentation.txt
  exit 1
fi
