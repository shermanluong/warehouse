import Layout from "../../layouts/layout";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import axios from "axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/packer/orders`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(res?.data || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStart = async (order) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/packer/startPacking/${order._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/packer/order/${order._id}`);
    } catch (err) {
      console.error("Failed to start packing:", err);
      alert("Error: Unable to start packing.");
    }
  };

  const filteredOrders = orders?.filter((order) =>
    order.totes?.some((tote) =>
      tote.name?.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  if (loading) return <div className="p-6 text-lg">Loading orders...</div>;

  return (
    <Layout headerTitle={"Orders"}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Search Box */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search by TOTE NAME..."
            className="w-full p-6 text-2xl border-2 border-blue-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-300"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
  
        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-extrabold text-2xl text-gray-900">
                      Order {order?.name}
                      {(order?.orderNote || order?.adminNote) && (
                        <span
                          title="This order has notes"
                          className="text-yellow-500 ml-3"
                        >
                          📌
                        </span>
                      )}
                    </h3>
                    <span className="bg-green-100 text-green-800 text-lg px-4 py-1 rounded-full font-bold border border-green-500 whitespace-nowrap">
                      {order.lineItemCount} items
                    </span>
                  </div>
  
                  {/* Totes */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {order.totes?.map((tote) => (
                      <div
                        key={tote._id}
                        className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-xl"
                      >
                        <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
                        <p className="text-base font-bold text-blue-900">
                          {tote.name}
                        </p>
                      </div>
                    ))}
                  </div>
  
                  {/* Customer Info */}
                  <div className="mb-2 flex justify-between text-base text-gray-700">
                    <span className="font-bold">Customer:</span>
                    <span className="font-mono text-green-700">
                      {order.customer?.first_name} {order.customer?.last_name}
                    </span>
                  </div>
  
                  {/* Packed Count */}
                  <div className="mb-6">
                    <span className="bg-green-100 text-green-800 border-2 border-green-600 text-lg px-4 py-1 rounded-full font-bold whitespace-nowrap">
                      {order?.packedCount} / {order?.lineItemCount} packed
                    </span>
                  </div>
  
                  {/* Action Button */}
                  <button
                    onClick={() => handleStart(order)}
                    className="w-full bg-blue-600 hover:bg-blue-800 text-white py-4 px-4 rounded-2xl text-2xl font-extrabold shadow-xl transition-all"
                  >
                    Start Packing
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-2xl text-center text-gray-400 col-span-full">
              No matching totes found.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
