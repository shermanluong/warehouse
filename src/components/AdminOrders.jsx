import React from "react";

const AdminOrders = () => {
    return (
        <>
            {/* Second line: Search input and button */}
            <div className="flex flex-col sm:flex-row sm:space-x-4 mb-3">
                <input
                    type="text"
                    placeholder="Search orders by number or customer name"
                    className="border rounded-md p-2 w-full mb-4 sm:mb-0"
                />
                <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 w-full sm:w-auto">
                    Search
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {Array(3).fill().map((_, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="font-semibold text-lg">Card {index + 6}</h3>
                        <p className="text-gray-600">Some content for card {index + 6}</p>
                    </div>
                ))}
            </div>
        </>
    );
};

export default AdminOrders;