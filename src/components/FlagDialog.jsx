import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Spinbox from './Spinbox';

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
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl relative"> {/* Added relative positioning here */}
          
          {/* Cancel Button - Positioned at the top-right */}
          <button
            onClick={onClose}
            className="absolute top-0 right-2 text-4xl text-gray-500 hover:text-gray-700 z-10" // Ensuring z-index for visibility
          >
            &times;
          </button>

          <Dialog.Title className="text-lg font-bold mb-4">Substitute Item</Dialog.Title>

          <div className="flex flex-col sm:flex-row justify-between border border-gray-200 rounded-lg p-4 shadow-md">
            <div className="flex items-start">
              <img src={lineItem?.image} alt={lineItem?.productTitle} className="w-24 h-24 rounded object-cover" />
              <div className="ml-4">
                <h3 className="font-semibold text-xl text-gray-900">
                  {lineItem?.variantInfo?.title === "Default Title"
                    ? lineItem?.productTitle
                    : lineItem?.variantInfo?.title}
                </h3>
                <p className="font-semibold text-md text-gray-900">
                  SKU: {lineItem?.variantInfo?.sku}
                </p>
                <p className="font-semibold text-md text-gray-900 mb-2">
                  Price: ${lineItem?.variantInfo?.price}
                </p>
                <p className="font-semibold text-md text-gray-900 mb-2">
                  {flagQuantity} units
                </p>
              </div>
            </div>

            <div className="flex mt-4 space-x-2 justify-between items-center sm:flex-col sm:mt-0 sm:space-x-0 sm:space-y-2">
              <select
                onChange={(e) => setSelectedFlag(e.target.value)}
                className="bg-red-500 text-white px-1 py-0 rounded-2xl"
                value={selectedFlag}
              >
                <option className="bg-white text-gray-900" value="Out Of Stock">
                  Out of Stock
                </option>
                <option className="bg-white text-gray-900" value="Damaged">
                  Damaged
                </option>
              </select>

              <div className="flex justify-end">
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="font-medium text-gray-700 mb-2">Suggested Substitutions</p>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {substitutions.length === 0 && (
                <li className="text-sm text-gray-500 italic">No substitutes available</li>
              )}
              {substitutions.map((item) => (
                <li
                  key={item.shopifyVariantId}
                  className={`border p-2 rounded flex justify-between items-center ${
                    selectedSubstitute?.variantId === item.variantId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-start">
                    <img src={item?.image} alt={item?.title} className="w-20 h-20 rounded object-cover" />
                    <div className="ml-3">
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                      <p className="text-xs text-gray-500">Price: ${item.price}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectSubstitute(item)}
                    disabled={!selectedFlag}
                    className={`text-sm px-4 py-2 rounded ${
                      selectedFlag ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-white'
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
