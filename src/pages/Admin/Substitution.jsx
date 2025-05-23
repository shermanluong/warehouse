import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../layouts/layout';
import ProductPickerDialog from '../../components/Modal/ProductPickerDialog';
import ImageZoomModal from '../../components/Modal/ImageZoomModal';

const Substitution = () => {
  const [rules, setRules] = useState([]);
  const [showAddRule, setShowAddRule] = useState(false);
  const [showAddSubstitute, setShowAddSubstitute] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState(null);

  //Image Modal
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchRules = async () => {
    const res = await axios.get(`${API_URL}/substitution/rules`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    console.log(res);
    setRules(res.data.rules);
  };

  useEffect(() => { fetchRules(); }, []);

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

  const handleSelectProduct = (variant) => {
    if (showAddRule) handleAddRule(variant);
    if (showAddSubstitute) handleAddSubstitute(variant);
  }

  const handleCloseDialog = () => {
    setShowAddRule(false);
    setShowAddSubstitute(false);
    setSelectedRuleId(null);
  }

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

  return (
    <Layout headerTitle="Substitution Rules">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white p-4 rounded-md shadow-md">
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold">Substitution Rules</h1>
            <button
              onClick={() => setShowAddRule(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              New Rule
            </button>
          </div>
  
          {rules.map(rule => (
            <div key={rule._id} className="mb-6 p-4 border border-gray-200 rounded shadow-md">
              <div className="flex items-center gap-4">
                <img 
                  src={rule.originProduct.image} 
                  className="w-24 h-24 rounded object-cover" 
                  alt={rule.originProduct.title} 
                  onClick={() => {
                    setEnlargedImage(rule.originProduct.image);
                    setIsImageOpen(true);
                  }}
                />
                <div>
                  <div className="font-semibold">{rule.originProduct.title}</div>
                  <div className="text-sm">SKU: {rule.originProduct.sku}</div>
                  <div className="text-sm">Price: ${rule.originProduct.price}</div>
                </div>
                <button
                  onClick={() => deleteRule(rule._id)}
                  className="ml-auto text-red-600 hover:underline text-base"
                >
                  Delete Rule
                </button>
              </div>
  
              <div className="mt-4 space-y-4">
                {rule?.substitutes?.map(sub => (
                  <div key={sub?.substituteVariantId} className="flex items-center gap-4 ml-4 p-2 border border-gray-200 rounded-md shadow-md">
                    <img 
                      src={sub?.substituteProduct?.image} 
                      className="w-20 h-20 rounded object-cover" 
                      alt={sub?.substituteProduct?.title} 
                      onClick={() => {
                        setEnlargedImage(sub?.substituteProduct?.image);
                        setIsImageOpen(true);
                      }}
                    />
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

        <ProductPickerDialog
          show={showAddRule || showAddSubstitute}
          setShowAddRule={setShowAddRule}
          setShowAddSubstitute={setShowAddSubstitute}
          setSelectedRuleId={setSelectedRuleId}
          handleSelectProduct={handleSelectProduct}
          handleCloseDialog={handleCloseDialog}
        />

        <ImageZoomModal
          isOpen={isImageOpen}
          onClose={() => setIsImageOpen(false)}
          imageUrl={enlargedImage}
        />
      </div>
    </Layout>
  );
};

export default Substitution;
