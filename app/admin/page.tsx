/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  collection,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [password, setPassword] = useState("");
  const [allowed, setAllowed] = useState(false);

  // ---------------------------
  // SIMPLE PASSWORD PROTECTION
  // ---------------------------
  const checkPass = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASS) {
      setAllowed(true);
    } else {
      alert("Wrong password");
    }
  };

  // ---------------------------
  // LIVE REALTIME ORDER LISTENER
  // ---------------------------
  useEffect(() => {
    if (!allowed) return;

    const ordersRef = collection(db, "orders");

    // REALTIME SNAPSHOT LISTENER
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setOrders(list);
    });

    return () => unsubscribe();
  }, [allowed]);

  // ---------------------------
  // MARK ORDER DELIVERED
  // ---------------------------
  const markDelivered = async (id: string) => {
    await updateDoc(doc(db, "orders", id), { status: "delivered" });
  };

  // ---------------------------
  // LOGIN UI
  // ---------------------------
  if (!allowed)
    return (
      <div className="p-4">
        <h1 className="font-bold text-xl mb-2">Admin Login</h1>
        <input
          type="password"
          placeholder="Enter Admin Password"
          className="border p-2 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={checkPass}
          className="bg-blue-600 text-white px-4 py-2 mt-2 rounded w-full"
        >
          Enter Dashboard
        </button>
      </div>
    );

  // ---------------------------
  // ADMIN DASHBOARD UI
  // ---------------------------
  return (
    <div className="p-4">
      <h1 className="font-bold text-2xl mb-4">Orders</h1>

      {orders.length === 0 && <p>No orders yet.</p>}

      {orders.map((o) => (
        <div
          key={o.id}
          className={`border p-3 rounded mb-4 ${
            o.status === "delivered"
              ? " border-green-400"
              : " border-yellow-400"
          }`}
        >
          <p className="font-semibold">Order ID: {o.id}</p>
          <p>Status: {o.status}</p>
          <p>
            Room {o.room}, {o.floor} floor, {o.building}
          </p>
          <p>Phone: {o.phone}</p>

          <p className="mt-2 font-semibold">Items:</p>
          <ul className="ml-4 list-disc">
            {(o.items ?? []).map((i: any) => (
              <li key={i.id}>
                {i.qty} × {i.name}
              </li>
            ))}
          </ul>

          <p className="mt-2 font-bold">Total: ₹{o.total}</p>

          {o.status !== "delivered" && (
            <button
              onClick={() => markDelivered(o.id)}
              className="mt-3 bg-green-600 text-white px-4 py-1 rounded"
            >
              Mark Delivered
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
