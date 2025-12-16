export default function Success() {
    return (
      <div className="p-4 text-center">
        <h1 className="font-bold text-2xl">Order Confirmed!</h1>
        <p className="mt-2">Your order will arrive in 5 minutes.</p>
  
        <a
          href={`tel:${process.env.NEXT_PUBLIC_OWNER_WHATSAPP}`}
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded"
        >
          Call Delivery Person
        </a>
      </div>
    );
  }
  