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
            className="w-full p-4 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-2xl text-gray-900">
                      Order {order?.name}
                      {(order?.orderNote || order?.adminNote) && (
                        <span
                          title="This order has notes"
                          className="text-yellow-500 ml-2"
                        >
                          📌
                        </span>
                      )}
                    </h3>
                    <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                      {order.lineItemCount} items
                    </span>
                  </div>

                  {/* Totes */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {order.totes?.map((tote) => (
                      <div
                        key={tote._id}
                        className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded"
                      >
                        <ShoppingCartIcon className="w-5 h-5 text-gray-700" />
                        <p className="text-sm font-medium text-gray-800">
                          {tote.name}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Customer Info */}
                  <div className="mb-2 flex justify-between text-sm text-gray-500">
                    <span>Customer:</span>
                    <span className="font-mono">
                      {order.customer?.first_name} {order.customer?.last_name}
                    </span>
                  </div>

                  {/* Packed Count */}
                  <div className="mb-4">
                    <span className="bg-green-100 text-green-800 border border-green-600 text-xs px-2 py-1 rounded-full">
                      {order?.packedCount} / {order?.lineItemCount} packed
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleStart(order)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-base font-semibold shadow"
                  >
                    Start Packing
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xl text-center text-gray-500 col-span-full">
              No matching totes found.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
