"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, DEVICE_ID } from "@/lib/firebase";

/**
 * Subscribes to the single AcoustiGrain wedge's device document in
 * Firestore via a real-time listener (onSnapshot), not polling. The
 * callback only fires when the underlying data actually changes, so
 * it stays cheap on low-end mobile browsers.
 */
export default function useDeviceListener() {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ref = doc(db, "devices", DEVICE_ID);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setDevice(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { device, loading, error };
}
