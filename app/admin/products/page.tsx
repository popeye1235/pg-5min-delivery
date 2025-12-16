"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      const snap = await getDocs(collection(db, "products"));
      if (!isMounted) return;
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateStock = async (id: string, newStock: number) => {
    await updateDoc(doc(db, "products", id), { stock: newStock });

    // re-fetch updated products
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  return (
    <div className="p-4">
      <h1 className="font-bold text-2xl mb-4">Manage Stock</h1>

      {products.map((p) => (
        <div key={p.id} className="border p-3 rounded mb-4">
          <h2 className="font-semibold">{p.name}</h2>
          <p>Current Stock: {p.stock}</p>

          <button
            onClick={() => updateStock(p.id, p.stock + 1)}
            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded mr-2"
          >
            + Add
          </button>

          <button
            disabled={p.stock === 0}
            onClick={() => updateStock(p.id, p.stock - 1)}
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded disabled:bg-gray-400"
          >
            - Remove
          </button>
        </div>
      ))}
    </div>
  );
}
