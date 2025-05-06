import React, { useEffect, useState } from 'react';
import { 
    PlusIcon, 
    MinusIcon, 
    XMarkIcon, 
    CheckIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'

const PickOrderComponent = ({ lineItem, OnClickImage }) => {
    
    return (
        <div className = "border border-gray-200 rounded-lg p-4 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between">
                {/* Left side: image + name + SKU */}
                <div className="flex items-start">
                    <img
                        src={lineItem?.image}
                        alt={lineItem?.productTitle}
                        className="w-48 h-48 rounded object-cover cursor-pointer"
                        onClick={() => OnClickImage(lineItem?.image)}
                    />
                    <div className="ml-4">
                        <h3 className="font-semibold text-2xl text-gray-900">
                            {lineItem?.variantInfo?.title === "Default Title"
                                ? lineItem?.productTitle
                                : lineItem?.variantInfo?.title}
                            {(lineItem.adminNote || lineItem.customerNote) && (
                                <span title="This item has notes" className="text-yellow-500 text-2xl ml-2">📌</span>
                            )}
                        </h3>

                        <p className="font-semibold text-xl text-gray-900">SKU: {lineItem?.variantInfo?.sku}</p>
                        {lineItem?.variantInfo?.barcode && 
                            <p className="font-semibold text-lg text-yellow-900">Barcode: {lineItem?.variantInfo?.barcode}</p>
                        }
                        <span className="font-semibold text-xl text-gray-900">
                            { 
                                lineItem?.pickedStatus?.verified.quantity 
                                +
                                lineItem?.pickedStatus?.damaged.quantity 
                                +
                                lineItem?.pickedStatus?.outOfStock.quantity 
                            } / {lineItem?.quantity} units
                        </span>

                        <div className="flex gap-1 mt-2 mb-2 flex-wrap">
                            {lineItem?.pickedStatus?.verified.quantity > 0 && (
                                <p className="text-lg text-white bg-green-500 rounded-2xl px-3 mt-2 sm:mt-0">
                                    {lineItem?.pickedStatus?.verified.quantity} picked
                                </p>
                            )}

                            {lineItem?.pickedStatus?.outOfStock.quantity > 0 && (
                                <p className="text-lg text-white bg-red-500 rounded-2xl px-3 mt-2 sm:mt-0">
                                    {lineItem?.pickedStatus?.outOfStock.quantity} Out Of Stock
                                </p>
                            )}

                            {lineItem?.pickedStatus?.damaged.quantity > 0 && (
                                <p className="text-lg text-white bg-red-500 rounded-2xl px-3 mt-2 sm:mt-0">
                                    {lineItem?.pickedStatus?.damaged.quantity} Damaged
                                </p>
                            )}
                        </div>
                        
                        {/* Notes Display */}
                        {lineItem.adminNote && (
                        <p className="text-xl text-red-600 mt-1">Admin: {lineItem.adminNote}</p>
                        )}
                        
                        {lineItem.customerNote && (
                        <p className="text-xl text-blue-600 mt-1">Customer: {lineItem.customerNote}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end mt-4 space-x-3 sm:flex-col sm:justify-start sm:mt-0 sm:space-x-0 sm:space-y-2 ">
                    
                    {!lineItem.picked && lineItem.quantity <= 1 &&
                        <button
                            title = "Pick item"
                            onClick={() => handlePickPlus(lineItem.shopifyLineItemId)}
                            className="bg-white text-green-600 border border-green-600 hover:bg-green-200 w-16 h-16 rounded flex items-center justify-center"
                        >
                            <CheckIcon className="w-10 h-10" />
                        </button>
                    }

                    {!lineItem.picked && lineItem.quantity > 1 &&
                        <>
                            <button
                                title = "Add one Item"
                                onClick={() => handlePickPlus(lineItem.shopifyLineItemId)}
                                className="bg-white text-blue-400 border border-blue-400 hover:bg-blue-200 w-16 h-16 rounded flex items-center justify-center"
                            >
                                <PlusIcon className="w-10 h-10" />
                            </button>
                            <button
                                title = "Remove one Item"
                                onClick={() => handlePickMinus(lineItem.shopifyLineItemId)}
                                className="bg-white text-stone-400 border border-stone-400 hover:bg-stone-200 w-16 h-16 rounded flex items-center justify-center"
                            >
                                <MinusIcon className="w-10 h-10" />
                            </button>
                        </>
                    }

                    {!lineItem.picked && 
                        <button 
                            title = "Flag Item"
                            onClick={() => openFlagDialog(lineItem)}
                            className="bg-white text-red-600 border border-red-600 hover:bg-red-200 w-16 h-16 rounded flex items-center justify-center"
                        >
                            <XMarkIcon className="w-10 h-10" />
                        </button>
                    }

                    {lineItem.picked && 
                        <button
                            title = "Undo" 
                            onClick={() => handleUndo(lineItem.shopifyLineItemId)}
                            className="bg-white text-blue-400 border border-blue-400 hover:bg-blue-200 w-16 h-16 rounded flex items-center justify-center"
                        >
                            <ArrowPathIcon className="w-10 h-10" />
                        </button>
                    }
                </div>
            </div>

            {lineItem?.substitution?.shopifyVariantId && 
                <div
                    className="flex flex-col sm:flex-row mt-4 justify-between border border-yellow-600 rounded-lg p-4"
                >
                    {/* Left side: image + name + SKU */}
                    <div className="flex items-start">
                        <img
                            src={lineItem?.substitution?.image}
                            alt={lineItem?.substitution?.title}
                            className="w-36 h-36 rounded object-cover"
                            onClick={() => OnClickImage(lineItem?.substitution?.image)}
                        />
                        <div className="ml-4 mt-2 sm:mt-0">
                            <h3 className="font-semibold text-2xl text-yellow-600">
                                Subbed: {lineItem?.substitution?.title}
                            </h3>

                            <p className="font-semibold text-xl text-gray-900">SKU: {lineItem?.substitution?.sku}</p>
                        </div>
                    </div>
                </div>  
            }
        </div>
    );
};

export default PickOrderComponent;