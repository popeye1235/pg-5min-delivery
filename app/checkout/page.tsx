"use client";

import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Checkout() {
  const { cart, total, add, decrease, clear } = useCart();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [room, setRoom] = useState("");
  const [floor, setFloor] = useState("");
  const [building, setBuilding] = useState("");

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty. Please add items first.");
      router.push("/");
      return;
    }
    
    if (!phone || !room || !floor || !building) {
      toast.error("Please fill all delivery details.");
      return;
    }

    const cleanItems = cart.map((item) => ({
      id: item.id,
      name: item.name,
      qty: item.qty,
      price: item.price,
      stock: item.stock, 
    }));

    const orderData = {
      items: cleanItems.map(({ stock, ...rest }) => rest), 
      total,
      phone,
      room,
      floor,
      building,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Update product stock in Firestore
      for (const item of cleanItems) {
        const ref = doc(db, "products", item.id);
        const newStock = (item.stock || 0) - item.qty;
        await updateDoc(ref, { stock: newStock });
      }

      // 2. Save new order to Firestore
      await addDoc(collection(db, "orders"), orderData);

      // 3. Prepare WhatsApp message
      const message = `
New Order!

Room: ${room}, Floor: ${floor}
Building: ${building}
Phone: ${phone}

Items:
${cleanItems.map((c) => `${c.qty} × ${c.name} (₹${c.price})`).join("\n")}

Total: ₹${total}
`;
      
      // 4. Clear cart state and localStorage
      clear(); 

      // 5. FIX: Push to success page first.
      router.push("/order/success");
      
      // 6. FIX: Open WhatsApp in a NEW tab so the user sees the success page.
      window.open(
        `https://wa.me/${process.env.NEXT_PUBLIC_OWNER_WHATSAPP}?text=${encodeURIComponent(
          message
        )}`,
        '_blank' 
      );

    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="font-bold text-2xl mb-4 text-white">Checkout</h1>

      {/* 🌟 Order Summary */}
      <div className="bg-none p-4 rounded-xl shadow-md mb-6 border border-gray-200">
        <h2 className="font-bold text-lg mb-3 text-white">Order Summary</h2>

        {cart.length === 0 ? (
          <p className="text-white">Your cart is empty.</p>
        ) : (
          <>
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between mb-3 pb-3"
              >
                <div className="font-medium text-white min-w-[40%]">{item.name}</div>

                <div className="flex items-center gap-2">
                  {/* decrease */}
                  <button
                    onClick={() => decrease(item.id)}
                    className="bg-green-600 cursor-pointer hover:bg-green-950 text-white h-6 w-6 rounded-full flex items-center justify-center text-sm"
                  >
                    –
                  </button>

                  <span className="text-white font-medium w-4 text-center">{item.qty}</span>

                  {/* add */}
                  <button
                    onClick={() => add(item)}
                    className="bg-green-600 text-white h-6 w-6 rounded-full flex items-center justify-center text-sm hover:bg-green-950"
                  >
                    +
                  </button>

                  <span className="ml-4 font-semibold text-white min-w-[70px] text-right">
                    ₹{item.qty * item.price}
                  </span>
                </div>
              </div>
            ))}

            <hr className="my-3 border-gray-200" />

            <div className="flex justify-between font-bold text-xl text-white">
              <span>TOTAL</span>
              <span>₹{total}</span>
            </div>
          </>
        )}
      </div>

      {/* 🌟 Delivery Details */}
      <h2 className="font-bold text-lg mb-3 text-white">Delivery Details</h2>
      <input
        type="tel"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-3 w-full mt-3 rounded-lg focus:ring-green-500 focus:border-green-500 text-white"
      />

      <input
        type="text"
        placeholder="Room No"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        className="border p-3 w-full mt-3 rounded-lg focus:ring-green-500 focus:border-green-500 text-white"
      />

      <input
        type="text"
        placeholder="Floor (e.g., 2nd Floor)"
        value={floor}
        onChange={(e) => setFloor(e.target.value)}
        className="border p-3 w-full mt-3 rounded-lg focus:ring-green-500 focus:border-green-500 text-white"
      />

      <input
        type="text"
        placeholder="Building Name/Hostel Name"
        value={building}
        onChange={(e) => setBuilding(e.target.value)}
        className="border p-3 w-full mt-3 rounded-lg focus:ring-green-500 focus:border-green-500 text-white"
      />

      <button
        onClick={placeOrder}
        disabled={cart.length === 0}
        className="bg-green-600 text-white mt-6 w-full py-3 rounded-lg font-semibold shadow-lg hover:bg-green-700 disabled:bg-gray-400"
      >
        {cart.length === 0 ? "Cart is Empty" : `Place Order (₹${total})`}
      </button>
    </div>
  );
}