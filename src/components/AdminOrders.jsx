import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import statusColorMap from '../utils/statusColorMap';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  EllipsisVerticalIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import NoteDialog from './NoteDialog';
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDate, setSelecteDate] = useState(null);
  const [formattedDate, setFormattedDate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const formattedToday = today.toLocaleDateString('en-CA');
    setSelecteDate(today); 
    setFormattedDate(formattedToday); 
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/getOrders`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: searchTerm,
            sort: sortOption,
            order: sortOrder,
            page: currentPage,
            limit: pageSize,
            date: formattedDate,
          }
        }
      );
      console.log(res?.data?.orders);
      setOrders(res?.data?.orders || []);
      setTotalPages(Math.ceil((res?.data?.total || 0) / pageSize));
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  useEffect(() => {
    if (formattedDate) {
      fetchOrders();
    }
  }, [searchTerm, sortOption, sortOrder, currentPage, pageSize, formattedDate]);

  const handlePageChange = (page) => setCurrentPage(page);
  
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleClickOutside = (event) => {
    const dropdowns = document.querySelectorAll('.dropdown-ref');
    let clickedInside = false;
    dropdowns.forEach((dropdown) => {
      if (dropdown.contains(event.target)) clickedInside = true;
    });
    if (!clickedInside) setOpenDropdownId(null);
  };

  const openNoteDialog = (order) => {
      setSelectedOrder(order);
      setShowDialog(true);
  };

  const handleNoteSubmit = async ({ note }) => {
      try {
        // Send note to backend
        const res = await axios.patch(
          `${import.meta.env.VITE_API_URL}/admin/order/${selectedOrder._id}/add-order-note`,
          { note },
          { headers: { Authorization: `Bearer ${token}` } }
        );
    
        const updatedOrder = res.data.order;
    
        // Update the local orders state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === updatedOrder._id
              ? { ...order, adminNote: updatedOrder.adminNote }
              : order
          )
        );
      } catch (error) {
        console.error("Failed to submit note:", error);
        alert("Error submitting note. Please try again.");
      }
  };
  
  const handleDatechange = (date) => {
    const tempDate = date.toLocaleDateString('en-CA');
    setFormattedDate(tempDate)
    setSelecteDate(date); 
  };

  const handleImport = async () => {
    setLoading(true); // Set loading to true when the import process starts
    try {
      // Send note to backend
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/shopify/sync-orders`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: {
            tripDate: formattedDate
          }
        }
      );

      fetchOrders();
    } catch (error) {
      console.error("Failed to import orders:", error);
      alert("Error importing orders. Please try again.");
    } finally {
      setLoading(false); // Set loading to false once the import is finished
    }
  };
  
  return (
      <>
          <div className="flex flex-col sm:flex-row sm:space-x-2 mb-3">
              <input
              type="text"
              placeholder="Search orders by number or customer name"
              className="border rounded-md p-2 w-full mb-4 sm:mb-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>

          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 justify-between items-left mb-4">
              {/*Left section*/}
              <div className="flex items-center">
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
                <span className="mx-4">{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                    className="px-4 py-2 bg-gray-200 rounded-md"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    <ArrowLeftIcon className='w-5 h-5' />
                </button>
                <button
                    className="px-4 py-2 ml-2 bg-gray-200 rounded-md"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    <ArrowRightIcon className='w-5 h-5' />
                </button>
              </div>
              {/*Right section*/}
              <div className="flex items-center">
                {/*Date picker section*/}
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
                <select
                    className="px-4 py-2 ml-2 border rounded-md"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                >
                  <option value='All'>All</option>
                  <option value='Zone1'>Zone1</option>
                  <option value='Zone2'>Zone2</option>
                  <option value='Zone3'>Zone3</option>
                  <option value='Zone4'>Zone4</option>
                  <option value='Zone5'>Zone5</option>
                  <option value='Zone6'>Zone6</option>
                  <option value='Zone7'>Zone7</option>
                  <option value='Zone8'>Zone8</option>
                  <option value='Zone9'>Zone9</option>
                  <option value='Zone10'>Zone10</option>
                  <option value='Zone11'>Zone11</option>
                  <option value='Zone12'>Zone12</option>
                  <option value='Zone13'>Zone13</option>
                  <option value='Zone14'>Zone14</option>
                  <option value='Zone15'>Zone15</option>
                  <option value='Zone16'>Zone16</option>
                  <option value='NEWY'>NEWY</option>
                  <option value='Central Coast'>Central Coast</option>
                  <option value='WOOL'>WOOL</option>
                  <option value='ACT'>ACT</option>
                  <option value='PickUp'>PickUp</option>
                  <option value='BONDI'>BONDI</option>
                  <option value='Wollongong'>Wollongong</option>
                  <option value='Ramsgate'>Ramsgate</option>
                  <option value='Warwick Farm'>Warwick Farm</option>
                  <option value='Kingscross'>Kingscross</option>
                  <option value='Kiama'>Kiama</option>
                  <option value='Berry'>Berry</option>
                  <option value='Canberra Sat'>Canberra Sat</option>
                  <option value='Mona Vale'>Mona Vale</option>
                  <option value='Manly'>Manly</option>
                  <option value='Marrickville'>Marrickville</option>
                  <option value='Haig'>Haig</option>
                  <option value='Gosford'>Gosford</option>
                </select>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDatechange}
                  className="px-4 py-2 ml-2 border rounded-md"
                  dateFormat="yyyy/MM/dd"
                />
                <button
                  className="px-4 py-2 ml-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50"
                  onClick={handleImport}
                  disabled={loading} // Disable button when loading is true
                >
                  {loading ? (
                    <ArrowPathIcon className="animate-spin h-5 w-5 text-white" /> // Heroicon spinner
                  ) : (
                    'Import'
                  )}
                </button>
              </div>
          </div>

          {orders?.length > 0 &&
              <div className="grid grid-cols-1 gap-4">
                  {orders.map(order => (
                      <div key={order?._id} className="bg-white p-4 rounded-lg shadow-md">
                          <div className="flex justify-between items-start relative">
                            <div className="flex">
                                <h3 className="text-2xl font-bold text-gray-900 mr-2">Order {order?.name}</h3>
                                <span className={`text-lg px-2 rounded-full ${statusColorMap[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                  {order.status}
                                </span>
                            </div>
                        
                            <div className="relative dropdown-ref">
                                <button
                                onClick={() => {
                                    setOpenDropdownId(openDropdownId === order?._id ? null : order?._id);
                                }}
                                >
                                <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
                                </button>
                        
                                {openDropdownId === order?._id && (
                                <div className="absolute right-0 mt-2 w-36 bg-gray-200 border border-gray-300 rounded-md shadow-lg z-10">
                                    <button
                                    type="button"
                                    onClick={() => {
                                        setOpenDropdownId(null);
                                        openNoteDialog(order);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-300"
                                    >
                                    Add note
                                    </button>
                                    <button
                                    type="button"
                                    onClick={() => {
                                        navigate(`/admin/order/${order._id}`);
                                        setOpenDropdownId(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-300"
                                    >
                                    Detail
                                    </button>
                                </div>
                                )}
                            </div>
                          </div>
                      
                          <div className="flex justify-between mt-1">
                            <p className="text-md text-gray-900">Customer:</p>
                            <span className="text-md text-gray-900">
                              {order.customer.first_name} {order.customer.last_name}
                            </span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <p className="text-md text-gray-900">Items:</p>
                            <span className="text-sm text-gray-900">{order.lineItemCount}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <p className="text-md text-gray-900">Picker:</p>
                            <span className="text-md text-gray-900">{order?.picker?.name}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <p className="text-md text-gray-900">Packer:</p>
                            <span className="text-md text-gray-900">{order?.packer?.name}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <p className="text-md text-gray-900">Routes:</p>
                            <span className="text-md text-gray-900">{order?.delivery?.tripId}({order?.delivery?.driverName})</span>
                          </div>

                          { false && 
                            <>
                              <div className="flex justify-between mt-1">
                                <p className="text-md text-gray-900">Start Time: </p>
                                <span className="text-md text-gray-900">{order?.delivery?.startTime}</span>
                              </div>

                              <div className="flex justify-between mt-1">
                                <p className="text-md text-gray-900">Stop Number</p>
                                <span className="text-md text-gray-900">{order?.delivery?.stopNumber}</span>
                              </div>
                            </>
                          }
                          
                          {order.adminNote && (
                            <div className="mt-1">
                                <p className="text-md text-red-600">Admin Note: {order.adminNote}</p>
                            </div>
                          )}
                      
                          {order.orderNote && (
                            <div className="mt-1">
                                <p className="text-md text-red-600">Customer Note: {order.orderNote}</p>
                            </div>
                          )}
                      </div>
                  ))}
              </div>
          }

          {orders?.length == 0 && 
            <div className="bg-white p-4 rounded-lg shadow-md">
              No data.
            </div>
          }

          {showDialog && selectedOrder && (
              <NoteDialog
                  isOpen={showDialog}
                  onClose={() => setShowDialog(false)}
                  onSubmit={handleNoteSubmit}
              />
          )}
      </>
  );
};

export default AdminOrders;
