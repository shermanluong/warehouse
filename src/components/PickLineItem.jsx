import React, { useEffect, useState } from 'react';
import { 
    PlusIcon, 
    MinusIcon, 
    XMarkIcon, 
    CheckIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'
import axios from 'axios';

const PickLineItem = ({ orderId, lineItem, OnClickImage, OnRefresh, OnFlagDialog }) => {
    const token = localStorage.getItem("token");

    const handlePickPlus = async (shopifyLineItemId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/picker/order/${orderId}/pick-plus`,
                { shopifyLineItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            OnRefresh();
        } catch (err) {
            console.error('Failed to pick plus', err);
        }
    };

    const handlePickMinus = async (shopifyLineItemId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/picker/order/${orderId}/pick-minus`,
                { shopifyLineItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            OnRefresh();
        } catch (err) {
            console.error('Failed to pick minus', err);
        }
    };

    const handleUndo = async (shopifyLineItemId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/picker/order/${orderId}/undo-item`,
                { shopifyLineItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            OnRefresh();
        } catch (err) {
            console.error('Failed to undo', err);
        }
    };

    return (
        <div className="border-2 border-blue-200 rounded-2xl p-6 shadow-xl bg-white mb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-6">
            {/* Left: Image + Info */}
            <div className="flex items-start gap-6 flex-1 min-w-0">
              <img
                src={lineItem?.image}
                alt={lineItem?.productTitle}
                className="w-36 h-36 sm:w-52 sm:h-52 rounded-2xl object-cover cursor-pointer flex-shrink-0 border-2 border-gray-200"
                onClick={() => OnClickImage(lineItem?.image)}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-2xl sm:text-3xl text-gray-900 truncate flex items-center">
                  {lineItem?.variantInfo?.title === "Default Title"
                    ? lineItem?.productTitle
                    : lineItem?.variantInfo?.title}
                  {(lineItem.adminNote || lineItem.customerNote) && (
                    <span title="This item has notes" className="text-yellow-500 text-2xl ml-3">📌</span>
                  )}
                </h3>
                <p className="font-bold text-xl text-gray-700 truncate mt-1">
                  SKU: <span className="font-mono">{lineItem?.variantInfo?.sku}</span>
                </p>
                {lineItem?.variantInfo?.barcode && (
                  <p className="font-semibold text-lg text-yellow-900 truncate">
                    Barcode: <span className="font-mono">{lineItem?.variantInfo?.barcode}</span>
                  </p>
                )}
                <span className="block font-extrabold text-2xl text-blue-800 mt-2 mb-2">
                  {lineItem?.pickedStatus?.verified.quantity +
                    lineItem?.pickedStatus?.damaged.quantity +
                    lineItem?.pickedStatus?.outOfStock.quantity} / {lineItem?.quantity} units
                </span>
                <div className="flex gap-3 flex-wrap mb-2">
                  {lineItem?.pickedStatus?.verified.quantity > 0 && (
                    <span className="text-xl text-white bg-green-600 rounded-2xl px-4 py-1 font-bold">
                      {lineItem?.pickedStatus?.verified.quantity} Picked
                    </span>
                  )}
                  {lineItem?.pickedStatus?.outOfStock.quantity > 0 && (
                    <span className="text-xl text-white bg-red-500 rounded-2xl px-4 py-1 font-bold">
                      {lineItem?.pickedStatus?.outOfStock.quantity} Out Of Stock
                    </span>
                  )}
                  {lineItem?.pickedStatus?.damaged.quantity > 0 && (
                    <span className="text-xl text-white bg-orange-500 rounded-2xl px-4 py-1 font-bold">
                      {lineItem?.pickedStatus?.damaged.quantity} Damaged
                    </span>
                  )}
                </div>
                {lineItem.adminNote && (
                  <p className="text-xl text-red-700 mt-2 font-bold truncate">Admin: {lineItem.adminNote}</p>
                )}
                {lineItem.customerNote && (
                  <p className="text-xl text-blue-700 mt-2 font-bold truncate">Customer: {lineItem.customerNote}</p>
                )}
              </div>
            </div>
      
            {/* Right: Big Friendly Buttons */}
            <div className="flex flex-row sm:flex-col gap-3 items-end sm:items-start mt-6 sm:mt-0 min-w-fit">
              {!lineItem.picked && lineItem.quantity <= 1 && (
                <button
                  title="Pick item"
                  onClick={() => handlePickPlus(lineItem.shopifyLineItemId)}
                  className="bg-green-600 hover:bg-green-700 text-white border-2 border-green-700 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-3xl font-extrabold"
                >
                  <CheckIcon className="w-10 h-10" />
                </button>
              )}
              {!lineItem.picked && lineItem.quantity > 1 && (
                <>
                  <button
                    title="Add one Item"
                    onClick={() => handlePickPlus(lineItem.shopifyLineItemId)}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-700 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-3xl font-extrabold"
                  >
                    <PlusIcon className="w-10 h-10" />
                  </button>
                  <button
                    title="Remove one Item"
                    onClick={() => handlePickMinus(lineItem.shopifyLineItemId)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 border-2 border-gray-400 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-3xl font-extrabold"
                  >
                    <MinusIcon className="w-10 h-10" />
                  </button>
                </>
              )}
              {!lineItem.picked && (
                <button
                  title="Flag Item"
                  onClick={() => OnFlagDialog(lineItem)}
                  className="bg-red-600 hover:bg-red-700 text-white border-2 border-red-700 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-3xl font-extrabold"
                >
                  <XMarkIcon className="w-10 h-10" />
                </button>
              )}
              {lineItem.picked && (
                <button
                  title="Undo"
                  onClick={() => handleUndo(lineItem.shopifyLineItemId)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white border-2 border-yellow-500 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-3xl font-extrabold"
                >
                  <ArrowPathIcon className="w-10 h-10" />
                </button>
              )}
            </div>
          </div>
      
          {/* Substitution */}
          {lineItem?.substitution?.shopifyVariantId && (
            <div className="flex flex-col sm:flex-row mt-6 justify-between border-2 border-yellow-600 rounded-2xl p-4 bg-yellow-50">
              <div className="flex items-start">
                <img
                  src={lineItem?.substitution?.image}
                  alt={lineItem?.substitution?.title}
                  className="w-28 h-28 sm:w-40 sm:h-40 rounded-xl object-cover cursor-pointer border-2 border-yellow-200"
                  onClick={() => OnClickImage(lineItem?.substitution?.image)}
                />
                <div className="ml-4 mt-2 sm:mt-0">
                  <h3 className="font-bold text-2xl text-yellow-700 truncate">
                    Subbed: {lineItem?.substitution?.title}
                  </h3>
                  <p className="font-semibold text-xl text-gray-900 truncate">
                    SKU: {lineItem?.substitution?.sku}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
};

export default PickLineItem;