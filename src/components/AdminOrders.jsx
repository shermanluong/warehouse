import React, { useEffect, useState } from 'react';
import axios from 'axios';
import statusColorMap from '../utils/statusColorMap';
import { 
    ArrowLeftIcon, 
    ArrowRightIcon, 
    MinusIcon, 
    XMarkIcon, 
    CheckIcon,
    CameraIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline'

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const token = localStorage.getItem("token");
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('title'); // Default to sorting by title
    const [sortOrder, setSortOrder] = useState('asc'); // Default ascending order
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(20); // Default to 20 products per page

    useEffect(() => {
        // Function to fetch orders from API
        const fetchOrders = async () => {
          try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin/getOrders`, 
                { 
                    headers: { Authorization: `Bearer ${token}` } ,
                    params: {
                        search: searchTerm,
                        sort: sortOption,
                        order: sortOrder,
                        page: currentPage,
                        limit: pageSize,
                    }
                }
            );
            console.log(res?.data);
            setOrders(res?.data?.orders || []);
            setTotalPages(Math.ceil(res?.data?.total / pageSize)); // Calculate total pages based on total count
          } catch (err) {
            console.error('Failed to fetch orders:', err);
          }
        };
    
        fetchOrders(); // Call the function on page load
    }, [searchTerm, sortOption, sortOrder, currentPage, pageSize]); // Empty dependency array = run once on mount

    // Handle pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1); // Reset to the first page when the page size changes
    };
    return (
        <>
            {/* Second line: Search input and button */}
            <div className="flex flex-col sm:flex-row sm:space-x-2 mb-3">
                <input
                    type="text"
                    placeholder="Search orders by number or customer name"
                    className="border rounded-md p-2 w-full mb-4 sm:mb-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Sort and Pagination Controls */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-4">
                <select
                  className="px-4 py-2 border rounded-md"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
                {false && 
                <>
                    <button
                    className={`p-2 ${sortOption === 'title' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setSortOption('title')}
                    >
                    Sort by Title
                    </button>
                    <button
                    className={`p-2 ${sortOption === 'price' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setSortOption('price')}
                    >
                    Sort by Price
                    </button>
                    <button
                    className={`p-2 ${sortOption === 'sku' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setSortOption('sku')}
                    >
                    Sort by SKU
                    </button>
                    <button
                    className={`p-2 ${sortOrder === 'asc' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </button>
                </>
                }
              </div>

              {/* Page Size Selector and Pagination */}
              <div className="flex items-center space-x-4">
                {/* Pagination Buttons */}
                <span className="mx-4">{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ArrowLeftIcon className='w-5 h-5'/>
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 rounded-md"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <ArrowRightIcon className='w-5 h-5'/>
                </button>
              </div>
            </div>

            {orders.length > 0 && 
                <div className="grid grid-cols-1 gap-4">
                    {orders?.map(order => (
                        <div key={order._id} className="bg-white p-4 rounded-lg shadow-md">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-900">Order #{order.shopifyOrderId}</h3>
                                <span
                                className={`text-xs px-2 py-1 rounded-full ${statusColorMap[order.status] || 'bg-gray-100 text-gray-800'}`}
                                >
                                    {order.status}
                                </span>
                            </div>
                            <div className="flex justify-between mt-3">
                                <p className="text-sm text-gray-500">Customer: </p>
                                <span className="font-mono text-sm text-gray-500">{order.customer.first_name} {order.customer.last_name}</span>
                            </div>
                            <div className="flex justify-between mt-3">
                                <p className="text-sm text-gray-500">Items: </p>
                                <span className="font-mono text-sm text-gray-500">{order.lineItemCount}</span>
                            </div>
                            <div className="flex justify-between mt-3">
                                <p className="text-sm text-gray-500">Picker: </p>
                                <span className="font-mono text-sm text-gray-500">{order?.picker?.name}</span>
                            </div>
                            <div className="flex justify-between mt-3">
                                <p className="text-sm text-gray-500">Packer: </p>
                                <span className="font-mono text-sm text-gray-500">{order?.packer?.name}</span>
                            </div>
                            <div className="flex justify-between mt-3">
                                <p className="text-sm text-gray-500">Routes: </p>
                                <span className="font-mono text-sm text-gray-500"></span>
                            </div>
                        </div>
                    ))}
                </div>
            }
            
        </>
    );
};

export default AdminOrders;