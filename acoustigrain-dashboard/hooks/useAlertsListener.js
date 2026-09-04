"use client";

import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db, DEVICE_ID } from "@/lib/firebase";

export default function useAlertsListener(rowCount = 15) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const alertsRef = collection(db, "devices", DEVICE_ID, "alerts");
    const q = query(alertsRef, orderBy("timestamp", "desc"), limit(rowCount));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAlerts(
        snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
          };
        })
      );
      setLoading(false);
    });

    return unsubscribe;
  }, [rowCount]);

  return { alerts, loading };
}
