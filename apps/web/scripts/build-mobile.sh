#!/bin/bash
# HIRRD MOBILE BUILD SCRIPT — run from apps/web/
set -e
echo "🚀 Hirrd Mobile Build Pipeline | Capacitor $(npx cap --version)"

echo "⏳ 1/5 Building Next.js static export..."
CAPACITOR_BUILD=1 npx next build --config next.config.capacitor.js
echo "✅ ./out/ ready"

echo "⏳ 2/5 Syncing web assets to native..."
npx cap sync
echo "✅ Synced"

echo "⏳ 3/5 Validating PWA files..."
for f in public/manifest.json public/sw.js public/icons/icon-192.png public/icons/icon-512.png; do
  [ -f "$f" ] && echo "  ✅ $f" || echo "  ❌ MISSING: $f"
done

echo "⏳ 4/5 iOS ready: npx cap open ios → Xcode → Archive"
echo "⏳ 5/5 Android ready: npx cap run android"
echo "✅ BUILD COMPLETE"
