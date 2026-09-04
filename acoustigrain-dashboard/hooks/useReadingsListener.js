"use client";

import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db, DEVICE_ID } from "@/lib/firebase";

/**
 * Streams the most recent N acoustic readings for the device in
 * real time. Firestore's query listener keeps this ordered and
 * capped server-side, so the client never has to page through
 * history to draw the live trend chart.
 */
export default function useReadingsListener(pointCount = 40) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const readingsRef = collection(db, "devices", DEVICE_ID, "readings");
    const q = query(readingsRef, orderBy("timestamp", "desc"), limit(pointCount));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rows = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
        };
      });
      // Firestore gives us newest-first for the "limit" to work;
      // reverse for a left-to-right timeline in the chart.
      setReadings(rows.reverse());
      setLoading(false);
    });

    return unsubscribe;
  }, [pointCount]);

  return { readings, loading };
}
