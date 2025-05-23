import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Spinbox from '../common/Spinbox';

const FlagDialog = ({ isOpen, onClose, lineItem, onSubmit, onSelectSubstitution }) => {
  const [selectedFlag, setSelectedFlag] = useState('Out Of Stock');
  const [selectedSubstitute, setSelectedSubstitute] = useState(null);
  const [substitutions, setSubstitutions] = useState([]);
  const [flagQuantity, setFlagQuantity] = useState(0);
  const [maxValue, setMaxValue] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen && lineItem?.productId && lineItem?.variantId) {
      setSelectedFlag('Out Of Stock');
      setSelectedSubstitute(null);
      const restQuantity = lineItem.quantity - (lineItem.pickedStatus.verified.quantity + lineItem.pickedStatus.outOfStock.quantity + lineItem.pickedStatus.damaged.quantity);
      setFlagQuantity(restQuantity);
      setMaxValue(restQuantity);
      fetchSubstitutions();
    }
  }, [isOpen, lineItem]);

  const fetchSubstitutions = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/substitution/suggests?productId=${lineItem.productId}&variantId=${lineItem.variantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubstitutions(res.data.substitutes || []);
    } catch (err) {
      console.error('Failed to fetch substitutions', err);
      setSubstitutions([]);
    }
  };

  const handleConfirm = () => {
    onSubmit({
      shopifyLineItemId: lineItem.shopifyLineItemId,
      reason: selectedFlag,
      quantity: flagQuantity
    });
    onClose();
  };

  const handleSelectSubstitute = (item) => {
    onSelectSubstitution({
      shopifyLineItemId: lineItem.shopifyLineItemId,
      reason: selectedFlag,
      quantity: flagQuantity,
      subbedProductId: item.shopifyProductId,
      subbedVariantId: item.shopifyVariantId,
    });
    onClose();
  };

  const handleValueChange = (newValue) => {
    setFlagQuantity(newValue);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl relative">
          
          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-4 text-5xl text-gray-400 hover:text-gray-700 z-10"
            aria-label="Close"
          >
            &times;
          </button>
  
          <Dialog.Title className="text-3xl font-extrabold mb-6 text-green-800 text-center">Substitute Item</Dialog.Title>
  
          {/* Main Product */}
          <div className="flex flex-col sm:flex-row justify-between border-2 border-gray-100 rounded-xl p-6 shadow-lg bg-gray-50 mb-6">
            <div className="flex items-center">
              <img src={lineItem?.image} alt={lineItem?.productTitle} className="w-32 h-32 rounded-xl object-cover border-2 border-blue-200" />
              <div className="ml-6">
                <h3 className="font-bold text-2xl text-gray-900 mb-1">
                  {lineItem?.variantInfo?.title === "Default Title"
                    ? lineItem?.productTitle
                    : lineItem?.variantInfo?.title}
                </h3>
                <p className="font-semibold text-lg text-gray-700">
                  SKU: <span className="font-mono">{lineItem?.variantInfo?.sku}</span>
                </p>
                <p className="font-semibold text-lg text-gray-700">
                  Price: <span className="text-green-700">${lineItem?.variantInfo?.price}</span>
                </p>
                <p className="font-bold text-xl text-blue-700 mt-2">
                  {flagQuantity} units
                </p>
              </div>
            </div>
  
            {/* Flag selection and confirm */}
            <div className="flex flex-col items-center justify-center mt-6 sm:mt-0">
              <select
                onChange={(e) => setSelectedFlag(e.target.value)}
                className="bg-red-600 text-white px-6 py-3 text-xl rounded-2xl font-bold mb-4 shadow focus:outline-none"
                value={selectedFlag}
              >
                <option className="bg-white text-gray-900" value="Out Of Stock">
                  Out of Stock
                </option>
                <option className="bg-white text-gray-900" value="Damaged">
                  Damaged
                </option>
              </select>
              <button
                onClick={handleConfirm}
                className="w-40 py-3 text-xl bg-blue-700 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-800"
              >
                Confirm
              </button>
            </div>
          </div>
  
          {/* Suggested Substitutions */}
          <div className="mt-4">
            <p className="font-extrabold text-2xl text-gray-800 mb-3 text-center">Suggested Substitutions</p>
            <ul className="space-y-4 max-h-72 overflow-y-auto">
              {substitutions.length === 0 && (
                <li className="text-lg text-gray-400 italic text-center">No substitutes available</li>
              )}
              {substitutions.map((item) => (
                <li
                  key={item.shopifyVariantId}
                  className={`border-2 p-4 rounded-xl flex justify-between items-center gap-4 ${
                    selectedSubstitute?.variantId === item.variantId ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <img src={item?.image} alt={item?.title} className="w-24 h-24 rounded-xl object-cover border" />
                    <div className="ml-4">
                      <p className="font-bold text-lg">{item.title}</p>
                      <p className="text-md text-gray-600">SKU: <span className="font-mono">{item.sku}</span></p>
                      <p className="text-md text-green-700 font-bold">Price: ${item.price}</p>
                    </div>
                  </div>
  
                  <button
                    onClick={() => handleSelectSubstitute(item)}
                    disabled={!selectedFlag}
                    className={`text-xl font-bold px-8 py-3 rounded-2xl shadow transition ${
                      selectedFlag
                        ? 'bg-blue-700 text-white hover:bg-blue-900'
                        : 'bg-gray-300 text-white cursor-not-allowed'
                    }`}
                  >
                    Select
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default FlagDialog;
