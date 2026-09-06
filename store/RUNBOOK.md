# Porch Cats — finish the App Store submission

Blocked only on a signed-in App Store Connect web session (password + 2FA). Everything after step 1 is scripted.

1. **Create the app record** (ASC web): Apps → "+" → New App.
   iOS · Name `Porch Cats: Kitty Collector` · English (U.S.) · Bundle ID `com.formaz.porchcats` (7D72F92GFT) · SKU `porchcats-kitty-collector-2026` · Full Access.
   Then App Information → "Declare Regulated Medical Device" → No → Save. App Privacy → User ID + Purchase History (App Functionality, not linked, no tracking) → Publish.
   Note the app id = `APP`.
2. Subscriptions: `cd ~/workspace/landed/.credentials && PYTHONPATH=. python3 ~/workspace/porchcats_subs.py APP` → prints GROUP + two sub ids.
3. Gold fish consumables: `PYTHONPATH=. python3 ~/workspace/porchcats/store/porchcats_iap.py APP` (four IAPs, prices, review screenshot). If the price-schedule POST fails, set the USA price for each in the ASC UI (In-App Purchases → pack → Price Schedule → $0.99/$1.99/$2.99/$3.99).
4. Metadata + screenshots: `PYTHONPATH=. python3 ~/workspace/porchcats/store/asc_metadata.py APP SUB_MONTHLY SUB_YEARLY`.
5. RevenueCat: project already has products/entitlement/offering (see memory). Put the iOS SDK key in `eas.json` → `EXPO_PUBLIC_REVENUECAT_IOS_KEY`, set `ascAppId`, commit, push.
6. Build: `gh workflow run porchcats-ios-build.yml -R rzhaosv/forma -f ref=main -f submit=false`; when green, `gh workflow run porchcats-ios-upload.yml -R rzhaosv/forma -f run_id=<RUN_ID>`.
7. Submit: `PYTHONPATH=. python3 ~/workspace/porchcats/store/asc_submit.py APP GROUP SUB_MONTHLY SUB_YEARLY` (attach build, add version + subs + group version, submit). Add the four IAPs to the submission in the ASC UI (each IAP page → Add for Review) before the final PATCH if the API refuses them.
8. Add to the review-watch cron; flip tryforma.app/porchcats/ + umbrella card on approval.
