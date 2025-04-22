import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';

const FlagDialog = ({ isOpen, onClose, lineItem, onSubmit }) => {
  const [selectedFlag, setSelectedFlag] = useState('');
  const [selectedSubstitute, setSelectedSubstitute] = useState(null);

  const handleConfirm = () => {
    console.log(1);
    onSubmit({
      productId: lineItem.productId,
      flag: selectedFlag
    });
    onClose();
  };

  const handleStatusChange = (event) => {
    const selectedStatus = event.target.value;
    console.log(selectedStatus);
    setSelectedFlag(selectedStatus);
};

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                <Dialog.Title className="text-lg font-bold mb-4">
                    Substitute Item
                </Dialog.Title>
                
                <div
                    key={lineItem.variantId}
                    className="flex flex-col sm:flex-row justify-between border border-gray-200 rounded-lg p-4 shadow-md"
                >
                    <div className="flex items-start">
                        <img
                            src={lineItem?.image}
                            alt={lineItem?.productTitle}
                            className="w-16 h-16 rounded object-cover"
                        />
                        <div className="ml-4">
                            <h3 className="font-semibold text-sm text-gray-900">
                                {lineItem?.variantInfo?.title === "Default Title"
                                    ? lineItem?.productTitle
                                    : lineItem?.variantInfo?.title}
                            </h3>
                            <p className="font-semibold text-sm text-gray-900">
                                ${lineItem?.variantInfo?.price} • SKU: {lineItem?.variantInfo?.sku}
                            </p>
                        </div>
                    </div>

                    <div className="flex mt-4 space-x-2 justify-end sm:flex-col sm:justify-center sm:mt-0 sm:space-x-0 sm:space-y-2">
                        <select
                            onChange={(e) => handleStatusChange(e)} // handle the change event
                            className="bg-red-500 text-white px-1 py-0 rounded-2xl"
                            defaultValue=""
                        >
                            <option className = "bg-white text-gray-900" value="" disabled>Select Status</option>
                            <option className = "bg-white text-gray-900" value="Out Of Stock">Out of Stock</option>
                            <option className = "bg-white text-gray-900" value="Damaged">Damaged</option>
                        </select>
                    </div>
                </div>

                {/* Substitution List */}
                <div className='mt-4'>
                    <p className="font-medium text-gray-700 mb-2">Suggested Substitutions</p>
                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                    {lineItem.substitution?.options?.map((item) => (
                        <li
                        key={item.variantId}
                        className={`border p-2 rounded cursor-pointer ${
                            selectedSubstitute?.variantId === item.variantId
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedSubstitute(item)}
                        >
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                        </li>
                    ))}
                    </ul>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end mt-6 space-x-2">
                    <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    >
                    Cancel
                    </button>
                    <button
                    onClick={handleConfirm}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={!selectedFlag}
                    >
                    Confirm
                    </button>
                </div>
            </Dialog.Panel>
        </div>
    </Dialog>
  );
}

export default FlagDialog;
