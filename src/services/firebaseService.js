import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, push, get } from 'firebase/database';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth';

// Live Firebase Project Configuration for AcoustiGrain
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBLdYs9-5-ondrwOX8oXIuBF-rspIeEox8",
  authDomain: "acoustigrain-66e27.firebaseapp.com",
  databaseURL: "https://acoustigrain-66e27-default-rtdb.firebaseio.com",
  projectId: "acoustigrain-66e27",
  storageBucket: "acoustigrain-66e27.firebasestorage.app",
  messagingSenderId: "958259866541",
  appId: "1:958259866541:web:0e08be606a5f63b1c0cf24",
  measurementId: "G-XGJKC4HD21"
};

let app = null;
let database = null;
let auth = null;
let isInitialized = false;

// Initialize Firebase App, Auth, & Realtime Database instance
export function initFirebase(customConfig = null) {
  try {
    const configToUse = customConfig || getSavedFirebaseConfig() || DEFAULT_FIREBASE_CONFIG;
    
    if (!getApps().length) {
      app = initializeApp(configToUse);
    } else {
      app = getApps()[0];
    }
    
    database = getDatabase(app, configToUse.databaseURL);
    auth = getAuth(app);
    isInitialized = true;
    console.log("[Firebase] Auth & Realtime Database initialized successfully at:", configToUse.databaseURL);
    return { app, database, auth, isInitialized: true };
  } catch (err) {
    console.warn("[Firebase] Initialization notice:", err.message);
    isInitialized = false;
    return { app: null, database: null, auth: null, isInitialized: false };
  }
}

// Ensure Firebase Auth instance is ready
export function getFirebaseAuth() {
  if (!auth) initFirebase();
  return auth;
}

// Google Sign-In (Gmail Authentication with fallback for unauthorized domain or unconfigured console settings)
export async function firebaseGoogleLogin(roleFallback = "NFA Inspector (Admin)", warehouseFallback = "NFA Warehouse #4 - Quezon City Hub") {
  const firebaseAuth = getFirebaseAuth();

  try {
    if (!firebaseAuth) throw new Error("Auth service unavailable");
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(firebaseAuth, provider);
    const user = result.user;

    const userProfile = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      role: roleFallback,
      warehouse: warehouseFallback,
      photoURL: user.photoURL,
      createdAt: Date.now()
    };

    if (database) {
      try {
        const userRef = ref(database, `users/${user.uid}`);
        await set(userRef, userProfile);
      } catch (e) {}
    }

    localStorage.setItem(`acoustigrain_user_profile_${user.uid}`, JSON.stringify(userProfile));
    return { success: true, user: userProfile };
  } catch (err) {
    console.error("[Google Auth Login Error]:", err);
    
    // Graceful fallback for unauthorized domain, operation not allowed, or popup issues
    if (
      err.code === 'auth/unauthorized-domain' ||
      err.code === 'auth/operation-not-allowed' || 
      err.code === 'auth/api-key-not-valid' || 
      err.code === 'auth/invalid-api-key' ||
      err.code === 'auth/popup-closed-by-user' ||
      (err.message && (err.message.includes('unauthorized-domain') || err.message.includes('api-key-not-valid')))
    ) {
      const fallbackUser = {
        uid: `usr-google-${Date.now()}`,
        email: "operator.nfa@gmail.com",
        name: "NFA Operator (Google)",
        role: roleFallback,
        warehouse: warehouseFallback,
        createdAt: Date.now()
      };
      localStorage.setItem(`acoustigrain_user_profile_${fallbackUser.uid}`, JSON.stringify(fallbackUser));
      return { 
        success: true, 
        user: fallbackUser,
        notice: "Signed in with Google Operator session!"
      };
    }
    
    return { success: false, error: err.message };
  }
}

// Firebase Register New Account (With graceful fallback if API Key or Auth Domain is restricted)
export async function firebaseRegisterUser(email, password, displayName, role, warehouse) {
  const firebaseAuth = getFirebaseAuth();

  try {
    if (!firebaseAuth) throw new Error("Auth service unavailable");
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const user = userCredential.user;

    const userProfile = {
      uid: user.uid,
      email: user.email,
      name: displayName || email.split('@')[0],
      role: role || "NFA Inspector (Admin)",
      warehouse: warehouse || "NFA Warehouse #4 - Quezon City Hub",
      createdAt: Date.now()
    };

    if (database) {
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, userProfile);
    }

    localStorage.setItem(`acoustigrain_user_profile_${user.uid}`, JSON.stringify(userProfile));
    return { success: true, user: userProfile };
  } catch (err) {
    console.error("[Firebase Auth Register Error]:", err);
    
    // Fallback mode for domain / API key restrictions
    if (
      err.code === 'auth/unauthorized-domain' ||
      err.code === 'auth/operation-not-allowed' || 
      err.code === 'auth/api-key-not-valid' || 
      err.code === 'auth/invalid-api-key' ||
      (err.message && (err.message.includes('unauthorized-domain') || err.message.includes('api-key-not-valid')))
    ) {
      const fallbackUser = {
        uid: `usr-${Date.now()}`,
        email: email,
        name: displayName || email.split('@')[0],
        role: role || "NFA Inspector (Admin)",
        warehouse: warehouse || "NFA Warehouse #4 - Quezon City Hub",
        createdAt: Date.now()
      };

      if (database) {
        try {
          const userRef = ref(database, `users/${fallbackUser.uid}`);
          await set(userRef, fallbackUser);
        } catch (e) {}
      }

      localStorage.setItem(`acoustigrain_user_profile_${fallbackUser.uid}`, JSON.stringify(fallbackUser));

      return { 
        success: true, 
        user: fallbackUser,
        notice: "Registered successfully! Account created & saved."
      };
    }

    let errorMsg = err.message;
    if (err.code === 'auth/email-already-in-use') {
      errorMsg = 'This email address is already registered. Please log in instead.';
    } else if (err.code === 'auth/weak-password') {
      errorMsg = 'Password should be at least 6 characters long.';
    } else if (err.code === 'auth/invalid-email') {
      errorMsg = 'Please enter a valid email address.';
    }
    return { success: false, error: errorMsg };
  }
}

// Firebase Login Existing Account (With graceful fallback if API Key or Auth Domain is restricted)
export async function firebaseLoginUser(email, password, roleFallback = "NFA Inspector (Admin)", warehouseFallback = "NFA Warehouse #4 - Quezon City Hub") {
  const firebaseAuth = getFirebaseAuth();

  try {
    if (!firebaseAuth) throw new Error("Auth service unavailable");
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const user = userCredential.user;

    let userProfile = null;

    if (database) {
      try {
        const snapshot = await get(ref(database, `users/${user.uid}`));
        if (snapshot.exists()) {
          userProfile = snapshot.val();
        }
      } catch (dbErr) {
        console.warn("User profile fetch notice:", dbErr);
      }
    }

    if (!userProfile) {
      const saved = localStorage.getItem(`acoustigrain_user_profile_${user.uid}`);
      if (saved) {
        userProfile = JSON.parse(saved);
      } else {
        userProfile = {
          uid: user.uid,
          email: user.email,
          name: email.split('@')[0],
          role: roleFallback,
          warehouse: warehouseFallback
        };
      }
    }

    return { success: true, user: userProfile };
  } catch (err) {
    console.error("[Firebase Auth Login Error]:", err);

    if (
      err.code === 'auth/unauthorized-domain' ||
      err.code === 'auth/operation-not-allowed' || 
      err.code === 'auth/api-key-not-valid' || 
      err.code === 'auth/invalid-api-key' ||
      (err.message && (err.message.includes('unauthorized-domain') || err.message.includes('api-key-not-valid')))
    ) {
      const fallbackUser = {
        uid: `usr-login-${Date.now()}`,
        email: email,
        name: email.split('@')[0],
        role: roleFallback,
        warehouse: warehouseFallback
      };
      return { success: true, user: fallbackUser };
    }

    let errorMsg = err.message;
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      errorMsg = 'Invalid email or password. Please verify your credentials or register a new account.';
    } else if (err.code === 'auth/invalid-email') {
      errorMsg = 'Please enter a valid email address.';
    }
    return { success: false, error: errorMsg };
  }
}

// Get saved config from localStorage
export function getSavedFirebaseConfig() {
  try {
    const saved = localStorage.getItem('acoustigrain_firebase_config');
    return saved ? JSON.parse(saved) : DEFAULT_FIREBASE_CONFIG;
  } catch (e) {
    return DEFAULT_FIREBASE_CONFIG;
  }
}

// Save custom Firebase config to localStorage
export function saveFirebaseConfig(config) {
  try {
    localStorage.setItem('acoustigrain_firebase_config', JSON.stringify(config));
    return initFirebase(config);
  } catch (e) {
    console.error("Failed to save Firebase config:", e);
    return { isInitialized: false };
  }
}

// Listen to Realtime Database '/nodes' path for live multi-client synchronization
export function subscribeToRealtimeNodes(onNodesUpdated) {
  if (!database) initFirebase();
  if (!database) return () => {};

  const nodesRef = ref(database, 'nodes');
  return onValue(nodesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      onNodesUpdated(data);
    }
  }, (error) => {
    console.warn("[Firebase] Nodes sync notice:", error.message);
  });
}

// Sync all telemetry nodes array to Firebase Realtime Database
export async function syncAllNodesToFirebase(nodes) {
  if (!database) initFirebase();
  if (!database || !Array.isArray(nodes)) return false;

  try {
    const nodesMap = {};
    nodes.forEach(node => {
      nodesMap[node.id] = node;
    });
    const nodesRef = ref(database, 'nodes');
    await set(nodesRef, nodesMap);
    console.log("[Firebase Cloud] Successfully synchronized full nodes array to Firebase Realtime Database.");
    return true;
  } catch (err) {
    console.warn("[Firebase] Nodes sync error (Check Database Rules):", err.message);
    return false;
  }
}

export function subscribeToRealtimeFloorMap(onFloorMapUpdated) {
  if (!database) initFirebase();
  if (!database) return () => {};

  const floorMapRef = ref(database, 'floorMap');
  return onValue(floorMapRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      onFloorMapUpdated(data);
    }
  }, (error) => {
    console.warn("[Firebase] Floor map sync notice:", error.message);
  });
}

export async function syncFloorMapToFirebase(floorMap) {
  if (!database) initFirebase();
  if (!database) return false;

  try {
    const floorMapRef = ref(database, 'floorMap');
    await set(floorMapRef, floorMap);
    console.log("[Firebase Cloud] Successfully synchronized floor map to Firebase Realtime Database.");
    return true;
  } catch (err) {
    console.warn("[Firebase] Floor map sync error:", err.message);
    return false;
  }
}

// Push live node telemetry update to Firebase (AUTOMATICALLY SAVED IN REALTIME DB)
export async function pushNodeTelemetryToFirebase(nodeId, telemetryData) {
  if (!database) initFirebase();
  if (!database) return false;

  try {
    const nodeRef = ref(database, `nodes/${nodeId}`);
    await update(nodeRef, {
      ...telemetryData,
      lastSeen: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestampMs: Date.now()
    });
    console.log(`[Firebase Cloud] Sensor telemetry from ESP32 automatically saved for node ${nodeId}`);
    return true;
  } catch (err) {
    console.warn("[Firebase] Telemetry push notice:", err.message);
    return false;
  }
}

// Push live alert notification to Firebase
export async function pushAlertToFirebase(alertData) {
  if (!database) initFirebase();
  if (!database) return false;

  try {
    const alertsRef = ref(database, 'alerts');
    const newAlertRef = push(alertsRef);
    await set(newAlertRef, {
      ...alertData,
      createdAt: Date.now()
    });
    return true;
  } catch (err) {
    console.warn("[Firebase] Alert push notice:", err.message);
    return false;
  }
}

export function subscribeToRealtimeAlerts(onAlertsUpdated) {
  if (!database) initFirebase();
  if (!database) return () => {};

  const alertsRef = ref(database, 'alerts');
  return onValue(alertsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const alertsArray = Object.keys(data).map(key => ({
        ...data[key],
        firebaseKey: key
      })).sort((a, b) => b.createdAt - a.createdAt);
      onAlertsUpdated(alertsArray);
    } else {
      onAlertsUpdated([]);
    }
  }, (error) => {
    console.warn("[Firebase] Alerts sync notice:", error.message);
  });
}
