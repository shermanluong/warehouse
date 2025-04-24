// components/ProductPickerDialog.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fragment } from 'react';

const ProductPickerDialog = ({
        show,
        handleSelectProduct,
        handleCloseDialog
    }) => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const token = localStorage.getItem("token");
    const [vendors, setVendors] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState("Rita's Farm Produce");
    const [selectedStatus, setSelectedStatus] = useState("ACTIVE");
    
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

    const fetchProducts = async () => {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/getProducts`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            params: { 
                search, 
                page, 
                limit: 20,
                vendor: selectedVendor || undefined, // Only send if selected
                status: selectedStatus || undefined, 
            },
        });
        console.log(res);
        setProducts(res.data.products);
        setTotalPages(Math.ceil(res.data.total / 20));
    };

    useEffect(() => { 
        fetchProducts(); 
    }, [search, page, selectedVendor, selectedStatus]);

    return (
        <Transition appear show={show} as={Fragment}>
            <Dialog 
                as="div" 
                className="relative z-10" 
                onClose={() => {handleCloseDialog()}}
            >
            <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
                    <DialogTitle className="text-lg font-medium">Select Product Variant</DialogTitle>
                    <div className="flex space-x-4 my-1">
                        <select
                            className="px-4 py-2 border rounded-md"
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
                    <input
                        className="mt-2 w-full border px-4 py-2 rounded"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="grid grid-cols-1 gap-4 mt-4 max-h-[400px] overflow-y-auto">
                        {products.map(product => (
                            product.variants?.map(variant => (
                            <div key={variant.shopifyVariantId} className="border border-gray-200 p-2 rounded flex gap-4 items-center shadow-md">
                                <img src={variant.image || product.image || '/placeholder.png'} className="w-20 h-20 rounded object-cover" />
                                <div className="flex-1">
                                <div>{variant.title === 'Default Title' ? product.title : variant.title}</div>
                                <div className="text-sm text-gray-600">SKU: {variant.sku}</div>
                                <div className="text-sm text-gray-600">Price: ${variant.price}</div>
                                </div>
                                <button
                                className="text-sm text-blue-600 hover:underline"
                                onClick={() => {
                                    const data = {
                                    productId: product.shopifyProductId,
                                    variantId: variant.shopifyVariantId,
                                    };
                                    handleSelectProduct(data);
                                }}
                                >Select</button>
                            </div>
                            ))
                        ))}
                    </div>

                    <div className="mt-6 flex justify-between">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)} className="text-sm text-gray-700">Previous</button>
                    <span className="text-sm">Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="text-sm text-gray-700">Next</button>
                    </div>
                </DialogPanel>
                </div>
            </div>
            </Dialog>
        </Transition>
    );
};

export default ProductPickerDialog;
