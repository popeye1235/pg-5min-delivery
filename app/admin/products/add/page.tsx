/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AddProduct() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ cleanup preview URL (important)
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image");
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAddProduct = async () => {
    if (loading) return;

    if (!name || !price || !stock || !category || !imageFile) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Upload image
      const imageRef = ref(
        storage,
        `products/${Date.now()}-${imageFile.name}`
      );      
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      // 2️⃣ Save product
      await addDoc(collection(db, "products"), {
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
        category: category.trim().toLowerCase(),
        imageUrl,
        createdAt: new Date().toISOString(),
      });

      toast.success("Product added successfully");
      router.push("/admin/products");

    } catch (err: any) {
        console.error("ADD PRODUCT ERROR 👉", err);
        toast.error(err?.message || "Failed to add product");
      }finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        Add New Product
      </h1>

      {/* IMAGE UPLOAD (UNCHANGED UI) */}
      <div className="mb-5">
        <label className="block mb-2 text-sm font-semibold text-white">
          Product Image
        </label>

        <div className="border-2 border-dashed border-gray-500 rounded-lg p-4 text-center hover:border-green-500 transition">
          <input
            type="file"
            accept="image/*"
            id="product-image"
            className="hidden"
            onChange={handleImageChange}
          />

          <label htmlFor="product-image" className="cursor-pointer">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="mx-auto h-40 object-contain rounded"
              />
            ) : (
              <p className="text-gray-400 text-sm">
                Click to upload image
              </p>
            )}
          </label>
        </div>
      </div>

      {/* FORM FIELDS (UNCHANGED UI) */}
      <input
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-3 w-full rounded mb-3 text-white bg-black"
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="border p-3 w-full rounded mb-3 text-white bg-black"
      />

      <input
        type="number"
        placeholder="Stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="border p-3 w-full rounded mb-3 text-white bg-black"
      />

      <input
        placeholder="Category (chips, drinks)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border p-3 w-full rounded mb-5 text-white bg-black"
      />

      <button
        onClick={handleAddProduct}
        disabled={loading}
        className="bg-green-600 w-full py-3 rounded-lg font-semibold text-white hover:bg-green-700 disabled:bg-gray-500"
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </div>
  );
}
