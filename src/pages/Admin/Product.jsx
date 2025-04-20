import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../layouts/layout';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('title'); // Default to sorting by title
  const [sortOrder, setSortOrder] = useState('asc'); // Default ascending order
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20); // Default to 20 products per page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/getProducts`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: searchTerm,
            sort: sortOption,
            order: sortOrder,
            page: currentPage,
            limit: pageSize,
          }
        });
        setProducts(res?.data?.products || []);
        setTotalPages(Math.ceil(res?.data?.total / pageSize)); // Calculate total pages based on total count
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, sortOption, sortOrder, currentPage, pageSize]);

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page when the page size changes
  };

  if (loading) return <div className="p-4 text-center">Loading products...</div>;

  return (
    <Layout headerTitle={"Products"}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white p-4 rounded-sm shadow-md">
          <div className="flex flex-col gap-4">
            {/* Sort and Pagination Controls */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-4">
                {/* Sort Options */}
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
                {/* Sort Order Toggle */}
                <button
                  className={`p-2 ${sortOrder === 'asc' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>

              {/* Page Size Selector and Pagination */}
              <div className="flex items-center space-x-4">
                {/* Page Size Dropdown */}
                <select
                  className="p-2 border rounded-md"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>

                {/* Pagination Buttons */}
                <button
                  className="px-4 py-2 bg-gray-200 rounded-md"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
                <span className="mx-4">{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                  className="px-4 py-2 bg-gray-200 rounded-md"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <input
              type="text"
              className="p-2 border rounded-md mb-4"
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
