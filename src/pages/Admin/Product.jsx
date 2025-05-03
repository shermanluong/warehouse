import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../layouts/layout';
import { 
    ArrowLeftIcon, 
    ArrowRightIcon, 
} from '@heroicons/react/24/outline'

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('title'); // Default to sorting by title
  const [sortOrder, setSortOrder] = useState('asc'); // Default ascending order
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20); // Default to 20 products per page
  const [vendors, setVendors] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("Rita's Farm Produce");
  const [selectedStatus, setSelectedStatus] = useState("ACTIVE");
  const [syncLoading, setSyncLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/getProducts`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: searchTerm,
            sort: sortOption,
            order: sortOrder,
            page: currentPage,
            limit: pageSize,
            vendor: selectedVendor || undefined, // Only send if selected
            status: selectedStatus || undefined,
          }
        });
  
        setProducts(res?.data?.products || []);
        setTotalPages(Math.ceil(res?.data?.total / pageSize));
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProducts();
  }, [searchTerm, sortOption, sortOrder, currentPage, pageSize, selectedVendor, selectedStatus]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [vendorsRes, statusesRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_API_URL}/admin/getProductVendors`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          ),
          axios.get(
            `${import.meta.env.VITE_API_URL}/admin/getProductStatuses`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          )
        ]);
  
        setVendors(vendorsRes.data.vendors);
        setStatuses(statusesRes.data.statuses);
      } catch (err) {
        console.error('Error fetching filters:', err);
      }
    };
  
    fetchFilters();
  }, []);
  
  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page when the page size changes
  };

  const handleSync = () => {

  }

  if (loading) return <div className="p-4 text-center">Loading products...</div>;

  return (
    <Layout headerTitle={"Products"}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white p-4 rounded-sm shadow-md">
          <div className="flex flex-col gap-4">
            {/* Sort and Pagination Controls */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div className="flex space-x-2">
                <button
                  className='px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50'
                  onClick={handleSync}
                  disabled={syncLoading}
                >
                  Sync
                </button>
                <select
                  className="px-4 py-2 max-w-50 border rounded-md"
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                >
                  <option value="">All Vendors</option>
                  {vendors.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <select
                  className="px-4 py-2 border rounded-md"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {/* Page Size Selector and Pagination */}
              <div className="flex items-center space-x-4">
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

            {/* Search Bar */}
            <input
              type="text"
              className="p-2 border rounded-md"
              placeholder="Search products by title, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {products.length === 0 && (
              <div className="text-center text-gray-500">No products found.</div>
            )}

            {products.map((product) =>
              product.variants?.map((variant) => {
                const displayTitle =
                  variant.title === "Default Title" ? product.title : variant.title;

                return (
                  <div
                    key={variant.shopifyVariantId}
                    className="flex flex-col sm:flex-row justify-between border border-gray-200 rounded-lg p-4 shadow-md"
                  >
                    <div className="flex items-start">
                      <img
                        src={variant.image || product.image || '/placeholder.png'}
                        alt={displayTitle}
                        className="w-36 h-36 rounded object-cover"
                      />
                      <div className="ml-4">
                        <h3 className="font-semibold text-lg text-gray-900">{displayTitle}</h3>
                        <p className="text-sm text-gray-700">SKU: {variant.sku}</p>
                        <p className="text-sm text-gray-700">Price: ${variant.price}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Product;
