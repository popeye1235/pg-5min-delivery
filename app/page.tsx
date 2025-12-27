"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./lib/firebase";
import { useCart } from "./context/CartContext";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const { add, cart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      const snap = await getDocs(collection(db, "products"));
      const list: Product[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Product, "id">),
      }));
      setProducts(list);
    }
    fetchProducts();
  }, []);

  if (!mounted) return null; // 🔥 hydration fix

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="p-4">
      {/* Checkout FAB */}
      <a
        href="/checkout"
        className="fixed bottom-4 right-4 bg-green-600 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2"
      >
        Checkout
        <span className="bg-white text-green-600 font-bold px-2 py-0.5 rounded-full text-sm">
          {cartCount}
        </span>
      </a>

      <h1 className="font-bold text-xl mb-4">PG Delivery Store</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p.id} className="border rounded p-3 bg-black text-white">
            {/* IMAGE */}
            <div className="bg-white rounded mb-2 p-2 flex justify-center">
              <img
                src={p.imageUrl}
                alt={p.name}
                className="h-32 object-contain"
              />
            </div>

            <h2 className="font-semibold">{p.name}</h2>
            <p>₹{p.price}</p>
            <p className="text-sm text-gray-400">Stock: {p.stock}</p>

            <button
              disabled={p.stock <= 0}
              onClick={() => {
                add(p);
                toast.success(`${p.name} added`);
              }}
              className="mt-2 bg-blue-600 w-full py-1 rounded disabled:bg-gray-500"
            >
              {p.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
