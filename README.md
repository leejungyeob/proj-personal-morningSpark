# MorningSpark (MVP)

Quick Expo React Native app that displays a daily short prompt and allows saving/sharing. Uses local storage and local notifications. Ads will be added via AdMob (test IDs used for development).

To run:
1. Install dependencies: `npm install` or `yarn`
2. Start dev server: `npx expo start` (or `yarn start`)
3. Open on device with Expo Go and scan QR

Notes:
- Test ads are used by default. Replace with your AdMob App/AdUnit IDs before publishing.
- Local storage uses AsyncStorage; prompts seeded in prompts.json
