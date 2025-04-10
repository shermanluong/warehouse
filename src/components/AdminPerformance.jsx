import React from "react";

const AdminPerformance = () => {
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-3">
                <div className="bg-white p-4 rounded-sm shadow-md">
                    <h3 className="font-semibold text-lg mb-4">Pick Performance</h3>
                    <p className="text-lg text-gray-600 flex justify-center">No picker data available</p>
                </div>

                <div className="bg-white p-4 rounded-sm shadow-md">
                    <h3 className="font-semibold text-lg mb-4">Pack Performance</h3>
                    <p className="text-lg text-gray-600 flex justify-center">No packer data available</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-sm shadow-md">
                <h3 className="font-semibold text-lg mb-4">Order Processing Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="border-1 border-blue-200 p-4 rounded-sm">
                        <h3 className="font-bold text-4xl text-green-500 mb-4 flex justify-center">0</h3>
                        <p className="text-gray-600 flex justify-center">Completed Orders</p>
                    </div>
                    <div className="border-1 border-blue-200 p-4 rounded-sm">
                        <h3 className="font-bold text-4xl text-orange-500 mb-4 flex justify-center">0</h3>
                        <p className="text-gray-600 flex justify-center">In Progress</p>
                    </div>
                    <div className="border-1 border-blue-200 p-4 rounded-sm">
                        <h3 className="font-bold text-4xl text-red-500 mb-4 flex justify-center">0</h3>
                        <p className="text-gray-600 flex justify-center">Out of Stock</p>
                    </div>
                    <div className="border-1 border-blue-200 p-4 rounded-sm">
                        <h3 className="font-bold text-4xl text-yellow-700 mb-4 flex justify-center">0</h3>
                        <p className="text-gray-600 flex justify-center">Substitutions</p>
                    </div>
                </div>   
            </div>
        </>
    );
};

export default AdminPerformance;