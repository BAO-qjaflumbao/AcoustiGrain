# AcoustiGrain Dashboard

A Next.js + Firebase dashboard for a single AcoustiGrain wedge node (ESP32-S3 +
INMP441 MEMS mic) monitoring rice weevil (*Sitophilus oryzae*) infestation in a
small rice retailer's storage room. Auth is email/password via Firebase
Authentication; all live data (device status, acoustic readings, alerts) is
streamed with Firestore's `onSnapshot` real-time listeners — no polling.

---

## 1. Tech stack

| Layer        | Choice                                   |
|--------------|-------------------------------------------|
| Framework    | Next.js 14 (App Router)                   |
| Styling      | Tailwind CSS                              |
| Auth         | Firebase Authentication (email/password)  |
| Database     | Cloud Firestore (real-time listeners)     |
| Charts       | Recharts                                  |
| Hardware     | Seeed XIAO ESP32-S3 + INMP441 I2S mic     |

---

## 2. Firebase & Firestore setup (step by step)

### 2.1 Create the Firebase project

1. Go to <https://console.firebase.google.com/> and sign in with the Google
   account you want to own this project.
2. Click **Add project**.
3. Name it something like `acoustigrain-pilot`. Click **Continue**.
4. Google Analytics is optional for this project — you can toggle it off.
5. Click **Create project** and wait for it to finish provisioning.

### 2.2 Register a Web App and get your config keys

1. From the project's Overview page, click the **`</>`** (Web) icon to add a
   web app.
2. Give it a nickname, e.g. `acoustigrain-dashboard`. You do **not** need
   Firebase Hosting for this step (you can host on Vercel, Netlify, etc.).
3. Click **Register app**. Firebase will show a `firebaseConfig` object —
   keep this tab open, you'll copy these values into `.env.local` in step 4.

### 2.3 Enable Authentication

1. In the left sidebar, go to **Build → Authentication**.
2. Click **Get started**.
3. Under the **Sign-in method** tab, click **Email/Password**, toggle it
   **Enable**, and click **Save**.
4. (Optional, recommended) In the **Settings** tab of Authentication, turn on
   **Email enumeration protection** to avoid leaking which emails are
   registered.

### 2.4 Create the Firestore database

1. In the left sidebar, go to **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Start in production mode** (we ship explicit security rules
   below, so this is safe).
4. Pick a location close to the deployment site — for a Philippines pilot,
   `asia-southeast1` (Singapore) gives the lowest latency.
5. Click **Enable**.

### 2.5 Apply the security rules

1. Still in Firestore, go to the **Rules** tab.
2. Replace the default rules with the contents of `firestore.rules` from this
   project (also pasted below), then click **Publish**.

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    match /devices/{deviceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;

      match /readings/{readingId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
        allow update, delete: if false;
      }

      match /alerts/{alertId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
        allow update: if request.auth != null;
        allow delete: if false;
      }
    }
  }
}
```

> These rules assume a single pilot device shared by a small, trusted group
> of operators — any signed-in user can read/write the device doc and add
> readings/alerts. If you later support multiple retailers each with their
> own device, add an `ownerUid` field to each device document and change the
> `devices/{deviceId}` rule to check `resource.data.ownerUid == request.auth.uid`.

### 2.6 Seed the device document

The dashboard reads from `devices/{DEVICE_ID}` (default ID: `node-01`). Create
it once, either by hand or by letting the firmware create it on first boot.

**By hand (Firestore console):**
1. Go to **Firestore Database → Data**.
2. Click **Start collection**, name it `devices`.
3. Set the document ID to `node-01` (or whatever you'll put in
   `NEXT_PUBLIC_DEVICE_ID`).
4. Add these fields:

   | Field | Type | Example value |
   |---|---|---|
   | `name` | string | `Backroom wedge` |
   | `status` | string | `online` |
   | `infestationLevel` | string | `safe` |
   | `dB` | number | `-58` |
   | `battery` | number | `92` |
   | `gridConfig` | map | `{ rows: 3, cols: 3 }` |
   | `position` | map | `{ row: 1, col: 1 }` |
   | `lastSeen` | timestamp | (now) |
   | `updatedAt` | timestamp | (now) |

5. Click **Save**. The dashboard's "Node setup" page can update
   `gridConfig`/`position`/`name` afterwards — you don't need to hand-edit
   again.

### 2.7 Data model reference

```
devices/{deviceId}
  name: string
  status: "online" | "offline"
  infestationLevel: "safe" | "moderate" | "critical"
  dB: number                 // latest signal level in the 3–5 kHz band
  battery: number             // 0–100
  gridConfig: { rows: number, cols: number }
  position: { row: number, col: number }   // 0-indexed placement in the grid
  lastSeen: Timestamp
  updatedAt: Timestamp

devices/{deviceId}/readings/{readingId}
  timestamp: Timestamp
  dB: number
  infestationLevel: "safe" | "moderate" | "critical"
  peakFrequency: number       // Hz, optional

devices/{deviceId}/alerts/{alertId}
  timestamp: Timestamp
  level: "moderate" | "critical"
  message: string
  acknowledged: boolean

users/{uid}
  email: string
  fullName: string
  facilityName: string
  role: "operator"
  createdAt: Timestamp
```

### 2.8 How the ESP32-S3 should write data

The XIAO ESP32-S3 can't run the Firebase Admin SDK, so the usual pattern is:

1. Create a dedicated Firebase Auth user for the device itself (e.g.
   `node-01@device.acoustigrain.local` with a long random password), separate
   from operator accounts.
2. On boot, the firmware signs in via the Firebase **Auth REST API**
   (`POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword`)
   using your Web API key, to get an ID token.
3. The firmware then writes to Firestore via the **Firestore REST API**
   (`POST https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/devices/node-01/readings`)
   with `Authorization: Bearer <idToken>`, sending each new reading, and
   periodically `PATCH`-ing the parent `devices/node-01` document with the
   latest `status`, `dB`, `infestationLevel`, and `battery`.
4. Because ID tokens expire hourly, refresh them using the returned
   `refreshToken` before each deep-sleep/wake cycle.

This keeps the security rules simple (`request.auth != null`) while still
requiring the device to authenticate like any other client.

---

## 3. Project setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template and fill in your Firebase config
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_DEVICE_ID=node-01
```

(Values come from the `firebaseConfig` object shown in step 2.2.)

```bash
# 3. Run the dev server
npm run dev
```

Visit `http://localhost:3000` — you'll land on `/login`. Use **Create an
account** to register the first operator, which also creates a matching
`users/{uid}` profile document.

---

## 4. What's on each screen

- **`/login`, `/register`** — Firebase email/password auth.
- **`/dashboard`** — live status cards (node online/offline, infestation
  level, signal level, battery), the storage floor heatmap, a live acoustic
  trend chart, and a recent-alerts feed. All four update instantly via
  Firestore listeners inside `useEffect` hooks — no polling.
- **`/dashboard/settings`** ("Node setup") — define how many sack piles wide
  and deep the storage area is, and which cell the single wedge currently
  sits in. This is what makes the heatmap flexible to different storage
  layouts without touching code: it's just `gridConfig` and `position` on
  the device document.

---

## 5. Deploying

Any Next.js-friendly host works (Vercel is the path of least resistance).
Set the same environment variables from `.env.local` in the host's project
settings, and add the deployed domain to **Firebase Console → Authentication
→ Settings → Authorized domains**.
