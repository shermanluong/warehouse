import React from "react";

const AdminPhotos = () => {
    return (
        <div className="bg-white min-h-100 p-4 shadow-md flex flex-col">
            <h3 className="font-semibold text-lg mb-3">Order Packing Photos</h3>
            <div className="flex-1 bg-gray-100 h-full flex items-center justify-center">
                {/* Content here */}
                <p className="text-gray-600">No packing photos available</p>
            </div>
        </div>
    );
};

export default AdminPhotos;