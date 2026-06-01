# Quantum App

Expo mobile client for Quantum, adapted from the `Quantum` web app. It keeps the same chat model tiers, tool toggles, local conversation history, attachments, settings, and `/api/chat` request contract.

## Run

```bash
npm install
npm start
```

Open the app with Expo Go, an emulator, or the web target from the Expo CLI.

## Chat endpoint

By default the app calls:

```bash
https://quantum.chefuinc.com/api/chat
```

For local development against the Next app, start `Quantum` and set:

```bash
EXPO_PUBLIC_QUANTUM_CHAT_API_URL=http://localhost:3003/api/chat
```

Then restart Expo so Metro picks up the environment variable.
