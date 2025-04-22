import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Layout from '../../layouts/layout';

const API_URL = import.meta.env.VITE_API_URL;

const Substitution = () => {
  const [rules, setRules] = useState([]);
  const [showAddRule, setShowAddRule] = useState(false);
  const [showAddSubstitute, setShowAddSubstitute] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRules = async () => {
    const res = await axios.get(`${API_URL}/substitution/rules`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    console.log(res);
    setRules(res.data.rules);
  };

  const fetchProducts = async () => {
    const res = await axios.get(`${API_URL}/admin/getProducts`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      params: { search, page, limit: 20 },
    });
    setProducts(res.data.products);
    setTotalPages(Math.ceil(res.data.total / 20));
  };

  const handleAddRule = async (variant) => {
    await axios.post(`${API_URL}/substitution/rules`, {
      originalProductId: variant.productId,
      originalVariantId: variant.variantId,
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setShowAddRule(false);
    fetchRules();
  };

  const handleAddSubstitute = async (variant) => {
    console.log(variant);
    await axios.put(`${API_URL}/substitution/rules/${selectedRuleId}/add-substitute`, {
      substituteProductId: variant.productId,
      substituteVariantId: variant.variantId,
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setShowAddSubstitute(false);
    setSelectedRuleId(null);
    fetchRules();
  };

  const deleteRule = async (ruleId) => {
    await axios.delete(`${API_URL}/substitution/rules/${ruleId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    fetchRules();
  };

  const deleteSubstitute = async (ruleId, variantId) => {
    await axios.put(`${API_URL}/substitution/rules/${ruleId}/remove-substitute`, {
      substituteVariantId: variantId,
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    fetchRules();
  };

  useEffect(() => { fetchRules(); }, []);
  useEffect(() => { if (showAddRule || showAddSubstitute) fetchProducts(); }, [search, page, showAddRule, showAddSubstitute]);

  return (
    <Layout headerTitle="Substitution Rules">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white p-4 rounded-sm shadow-md">
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold">Substitution Rules</h1>
            <button
              onClick={() => setShowAddRule(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              New Rule
            </button>
          </div>

          {rules.map(rule => (
            <div key={rule._id} className="mb-6 p-4 border border-gray-200 rounded shadow-md">
              <div className="flex items-center gap-4">
                <img src={rule.originProduct.image} className="w-24 h-24 rounded object-cover" />
                <div>
                  <div className="font-semibold">{rule.originProduct.title}</div>
                  <div className="text-sm">SKU: {rule.originProduct.sku}</div>
                  <div className="text-sm">Price: ${rule.originProduct.price}</div>
                </div>
                <button
                  onClick={() => deleteRule(rule._id)}
                  className="ml-auto text-red-600 hover:underline"
                >
                  Delete Rule
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {rule?.substitutes?.map(sub => (
                  <div key={sub?.substituteVariantId} className="flex items-center gap-4 ml-4 p-2 border border-gray-200 rounded-md shadow-md">
                    <img src={sub?.substituteProduct?.image} className="w-20 h-20 rounded object-cover" />
                    <div>
                      <div>{sub?.substituteProduct?.title}</div>
                      <div className="text-sm">SKU: {sub?.substituteProduct?.sku}</div>
                      <div className="text-sm">Price: ${sub?.substituteProduct?.price}</div>
                    </div>
                    <button
                      onClick={() => deleteSubstitute(rule._id, sub?.substituteVariantId)}
                      className="ml-auto text-red-500 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setSelectedRuleId(rule._id); setShowAddSubstitute(true); }}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Add Substitute
              </button>
            </div>
          ))}
        </div>
        {/* Product Picker Dialog */}
        <Transition appear show={showAddRule || showAddSubstitute} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => {
            setShowAddRule(false);
            setShowAddSubstitute(false);
            setSelectedRuleId(null);
          }}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
                  <Dialog.Title className="text-lg font-medium">Select Product Variant</Dialog.Title>
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
                              if (showAddRule) handleAddRule(data);
                              if (showAddSubstitute) handleAddSubstitute(data);
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
                </Dialog.Panel>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </Layout>
  );
};

export default Substitution;
