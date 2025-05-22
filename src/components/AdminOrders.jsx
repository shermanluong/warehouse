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
import { toast } from 'react-toastify';
import DriverDropdown from './DriverDropdown';
import ZoneDropdown from './ZoneDropDown';
import DropdownActionButton from './DropdownActionButton';

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
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedZones, setSelectedZones] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [drivers, setDrivers] = useState([]);

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

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (formattedDate) {
      fetchOrders();
    }
  }, [searchTerm, sortOption, sortOrder, currentPage, pageSize, formattedDate, selectedDrivers, selectedZones]);

  const fetchDrivers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/getDrivers`,
        {
          headers: {Authorization: `Bearer ${token}`},
          params: {}
        }
      );
      
      setDrivers(res.data.drivers);
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    }
  };

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
            driver: selectedDrivers,
            tag: selectedZones,
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
            tripDate: formattedDate,
            driver: selectedDrivers,
            tag: selectedZones
          }
        }
      );
      
      toast.success("Orders imported successfully.");
      fetchOrders();
    } catch (error) {
      console.error("Failed to import orders:", error);
      toast.error("Unable to import orders. Please try again.");
    } finally {
      setLoading(false); // Set loading to false once the import is finished
    }
  };

  const handleDelete = async () => {
    setLoading(true); 
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/orders/by-date`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: {
            date: formattedDate, // Make sure formattedDate is in correct format
          }
        }
      );
  
      toast.success(`Orders from ${formattedDate} deleted successfully.`);
      fetchOrders(); // Refresh the order list
    } catch (error) {
      console.error("Failed to delete orders by date:", error);
      toast.error("Unable to delete orders by date. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    setLoading(true);
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/orders`,
        { 
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      toast.success("All orders deleted successfully.");
      fetchOrders(); // Refresh the order list
    } catch (error) {
      console.error("Failed to delete all orders:", error);
      toast.error("Unable to delete all orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      {/* Search bar */}
        <div className="flex flex-col sm:flex-row sm:space-x-2 mb-4">
        <input
          type="text"
          placeholder="Search orders by number or customer name"
          className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-400 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filters and actions */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:justify-between sm:items-center mb-6">
        {/* Left: Pagination */}
        
        <div className="flex items-center">
          <select
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 transition"
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
          <span className="mx-4 text-sm text-gray-600">{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ArrowLeftIcon className='w-5 h-5' />
          </button>
          <button
            className="px-3 py-2 ml-2 bg-gray-100 hover:bg-gray-200 rounded-md transition disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ArrowRightIcon className='w-5 h-5' />
          </button>
        </div>
        
        {/* Right: Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <DriverDropdown
            drivers={drivers}
            selected={selectedDrivers}
            onChangeSelected={setSelectedDrivers}
          />
          <ZoneDropdown
            selectedZones={selectedZones}
            setSelectedZones={setSelectedZones}
          />
          <DatePicker
            selected={selectedDate}
            onChange={handleDatechange}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 transition"
            dateFormat="yyyy/MM/dd"
          />
          <DropdownActionButton
            loading={loading}
            handleImport={handleImport}
            handleDelete={handleDelete}
            handleDeleteAll={handleDeleteAll}
          />
        </div>
      </div>

      {/* Order Cards */}
      {orders?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {orders.map(order => (
            <div key={order?._id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg border border-gray-100 transition">
              <div className="flex justify-between items-start relative">
                <div className="flex">
                  <h3 className="text-xl font-bold text-gray-900 mr-2">Order {order?.name}</h3>
                  <span className={`text-base px-2 rounded-full font-medium ${statusColorMap[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="relative dropdown-ref">
                  <button
                    onClick={() => setOpenDropdownId(openDropdownId === order?._id ? null : order?._id)}
                    className="p-1 rounded hover:bg-gray-100 transition"
                  >
                    <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  {openDropdownId === order?._id && (
                    <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdownId(null);
                          openNoteDialog(order);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      >
                        Add note
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/admin/order/${order._id}`);
                          setOpenDropdownId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      >
                        Detail
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Customer:</span>
                  <span className="text-sm text-gray-800 font-medium">
                    {order.customer.first_name} {order.customer.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Items:</span>
                  <span className="text-sm text-gray-800">{order.lineItemCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Picker:</span>
                  <span className="text-sm text-gray-800">{order?.picker?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Packer:</span>
                  <span className="text-sm text-gray-800">{order?.packer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Routes:</span>
                  <span className="text-sm text-gray-800">{order?.delivery?.tripId} ({order?.delivery?.driverName})</span>
                </div>
                {order.adminNote && (
                  <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 px-3 py-1 rounded text-yellow-700 text-sm">
                    <span className="font-medium">Admin Note:</span> {order.adminNote}
                  </div>
                )}
                {order.orderNote && (
                  <div className="mt-2 bg-blue-50 border-l-4 border-blue-400 px-3 py-1 rounded text-blue-700 text-sm">
                    <span className="font-medium">Customer Note:</span> {order.orderNote}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow text-center text-gray-400 text-lg">
          No data.
        </div>
      )}

      {/* Note Dialog */}
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
