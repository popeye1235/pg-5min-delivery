"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./lib/firebase";
import { useCart } from "./context/CartContext";
import toast from "react-hot-toast"; // Ensure toast is imported

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const { add, cart } = useCart();

const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);


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

  return (
    <div className="p-4">
      <a
        href="/checkout"
        className="fixed bottom-4 right-4 bg-green-600 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2"
      >
        Checkout
        {/* Cart Count Badge */}
        <span className="bg-white text-green-600 font-bold px-2 py-0.5 rounded-full text-sm">
          {cartCount}
        </span>
      </a>


      <h1 className="font-bold text-xl mb-4">PG Delivery Store</h1>

      <div className="grid grid-cols-2 gap-4">
        {products.map((p) => (
          <div key={p.id} className="border p-3 rounded">
            <h2 className="font-semibold">{p.name}</h2>
            <p>₹{p.price}</p>
            <p className="text-sm text-gray-500">Stock: {p.stock}</p>

            <button
              disabled={p.stock <= 0}
              onClick={() => { add(p);
                toast.success(`${p.name} added to cart`);
              }
              }
              className="mt-2 bg-blue-600 cursor-pointer hover:bg-blue-300 text-white w-full py-1 rounded disabled:bg-gray-400"
            >
              {p.stock > 0 ? "Add to Cart" : "Unavailable"}
            </button>

            {/* ⭐ Show message when stock is zero */}
            {p.stock <= 0 && (
              <p className="text-red-500 text-xs mt-1">Out of Stock</p>
            )}
          </div>

        ))}
      </div>

    </div>
  );
}