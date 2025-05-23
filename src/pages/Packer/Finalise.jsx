import Layout from '../../layouts/layout';
import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import {
  PlusIcon, MinusIcon, CheckIcon, ArrowPathIcon, XMarkIcon,
  CurrencyDollarIcon, PrinterIcon, ArrowLongRightIcon, PencilSquareIcon, FlagIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import dataURLToFile from '../../utils/dataURLToFile';
import BarcodeScanner from '../../components/common/BarcodeScanner';
import BarcodeListener from '../../components/common/BarcodeListener';
import CameraModal from '../../components/Modal/CameraModal';
import ImageZoomModal from '../../components/Modal/ImageZoomModal';
import Spinbox from '../../components/common/Spinbox';
import FlagDialog from '../../components/Modal/FlagDialog'
import { generatePackingSlip, generateDeliveryLabel } from '../../utils/print';
import { useLoading } from "../../Context/LoadingContext";
import { toast } from 'react-toastify';

export default function Finalise() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [barcodeStatus, setBarcodeStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState('');
  const [boxCount, setBoxCount] = useState(0);
  const [allPacked, setAllPacked] = useState(false);
  const { setLoading } = useLoading();
  const token = localStorage.getItem("token");

  // UI state: which item is in "pick mode"
  const [pickModeIdx, setPickModeIdx] = useState(null);
  // For flag dialog
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagDialogItem, setFlagDialogItem] = useState(null);
  // For repick confirmation
  const [confirmResetItemIdx, setConfirmResetItemIdx] = useState(null);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    setAllPacked(lineItems.length > 0 && lineItems.every(item => item.packed));
  }, [lineItems]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/packer/order/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(res?.data || null);
      setLineItems(res?.data?.lineItems || []);
      setCapturedPhotos(res?.data?.photos || []);
    } catch (err) {
      toast.error('Failed to fetch order');
    }
  };

  // --- Packing Logic ---
  const handlePackPlus = async (shopifyLineItemId) => {
    await patchOrder(`/packer/order/${order._id}/pack-plus`, { shopifyLineItemId });
  };
  const handlePackMinus = async (shopifyLineItemId) => {
    await patchOrder(`/packer/order/${order._id}/pack-minus`, { shopifyLineItemId });
  };
  const handleUndo = async (shopifyLineItemId) => {
    await patchOrder(`/packer/order/${order._id}/undo-item`, { shopifyLineItemId });
  };

  // --- Picking Logic (for pick UI) ---
  const handlePickPlus = async (shopifyLineItemId) => {
    await patchOrder(`/picker/order/${order._id}/pick-plus`, { shopifyLineItemId });
  };
  const handlePickMinus = async (shopifyLineItemId) => {
    await patchOrder(`/picker/order/${order._id}/pick-minus`, { shopifyLineItemId });
  };
  const handlePickUndo = async (shopifyLineItemId) => {
    await patchOrder(`/picker/order/${order._id}/undo-item`, { shopifyLineItemId });
  };

  // --- Flagging & Substitution (Picker) ---
  const openFlagDialog = (item) => {
    setFlagDialogItem(item);
    setShowFlagDialog(true);
  };
  const handleFlagSubmit = async ({ shopifyLineItemId, reason, quantity }) => {
    await patchOrder(`/picker/order/${order._id}/pick-flag`, { shopifyLineItemId, reason, quantity });
    setShowFlagDialog(false);
    fetchOrder();
  };
  const handleSubstitutionSelect = async ({
    shopifyLineItemId,
    reason,
    quantity,
    subbedProductId,
    subbedVariantId,
  }) => {
    await patchOrder(`/picker/order/${order._id}/pick-substitute`, {
      shopifyLineItemId, reason, quantity, subbedProductId, subbedVariantId
    });
    setShowFlagDialog(false);
    fetchOrder();
  };

  // --- Shared Patch/Post Helper ---
  const patchOrder = async (url, data) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}${url}`, data, { headers: { Authorization: `Bearer ${token}` } });
      fetchOrder();
    } catch (err) {
      toast.error('Failed to update item');
    }
  };

  const postOrder = async (url, data) => {
    try {
        await axios.post(`${import.meta.env.VITE_API_URL}${url}`, data, { headers: { Authorization: `Bearer ${token}` } });
        fetchOrder();
    } catch (err) {
        toast.error('Failed to update item');
    }
  };

  // --- Barcode ---
  const handleScan = async (barcode) => {
    if (!barcode) {
      setBarcodeStatus("Please input barcode");
      setTimeout(() => setBarcodeStatus(""), 2000);
      return;
    }
    const scannedItem = lineItems.find(item => item.variantInfo?.barcode === barcode);
    if (!scannedItem) {
      setBarcodeStatus("No matching item found for the scanned barcode.");
    } else if (scannedItem.packed) {
      setBarcodeStatus("This item is already packed.");
    } else {
      await patchOrder(`/packer/order/${order._id}/pack-plus`, { shopifyLineItemId: scannedItem.shopifyLineItemId });
      setBarcodeStatus(`Successfully packed: ${scannedItem.productTitle}`);
    }
    setTimeout(() => setBarcodeStatus(""), 2000);
  };

  // --- Camera & Photos ---
  const handleUpload = async (image) => {
    const file = dataURLToFile(image, `order-photo-${Date.now()}.jpg`);
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/upload/image`, {
      fileBase64: image,
      fileName: file.name
    });
    const imageUrl = res.data.url;
    const fileId = res.data.fileId;
    await patchOrder(`/packer/order/${order._id}/save-photo`, { photoUrl: imageUrl, fileId });
    setCapturedPhotos(prev => [...prev, { photoUrl: imageUrl, fileId }]);
  };

  const handleDeletePhoto = async (fileIdToDelete) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/packer/order/${order._id}/delete-photo`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { fileId: fileIdToDelete },
      });
      setCapturedPhotos(photos => photos.filter(photo => photo.fileId !== fileIdToDelete));
    } catch (error) {
      toast.error('Failed to delete photo.');
    }
  };

  // --- Packing Controls ---
  const handBoxCountChange = (newValue) => setBoxCount(newValue);
  const handlePrintPackingSlip = () => { generatePackingSlip(order); };
  const handlePrintDeliveryLabel = () => { generateDeliveryLabel(order, boxCount); };

  // --- Substitution & Refund ---
  const handleCancelSubstitution = async (shopifyLineItemId) => {
    await patchOrder(`/packer/order/${order._id}/cancel-sub-item`, { shopifyLineItemId });
  };
    
  const handleConfirmSubstitution = async (shopifyLineItemId) => {
    await patchOrder(`/packer/order/${order._id}/confirm-sub-item`, { shopifyLineItemId });
  };
    
  const refundItem = async (id, shopifyOrderId, shopifyLineItemId, quantity) => {
    await postOrder(`/packer/refund-item`, { id, shopifyOrderId, shopifyLineItemId, quantity });
  };

  const handleCompletePacking = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/packer/order/${order._id}/complete-packing`,
        { boxCount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order packed');
      navigate(`/packer/orders`);
    } catch (err) {
      toast.error('Failed to pack order');
    } finally {
      setLoading(false);
    }
  };

  // --- Re-pick logic ---
  const handleRePick = (idx) => {
    setConfirmResetItemIdx(idx);
  };
  const confirmReset = async () => {
    if (confirmResetItemIdx == null) return;
    const item = lineItems[confirmResetItemIdx];
    await patchOrder(`/packer/order/${order._id}/undo-item`, { shopifyLineItemId: item.shopifyLineItemId });
    await patchOrder(`/picker/order/${order._id}/undo-item`, { shopifyLineItemId: item.shopifyLineItemId });
    setPickModeIdx(confirmResetItemIdx);
    setConfirmResetItemIdx(null);
    fetchOrder();
  };

  const cancelPickMode = () => {
    setPickModeIdx(null);
  };

  // --- UI Render ---
  return (
    <Layout headerTitle="Packing">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex flex-row mb-6 justify-between items-center">
            <h3 className="font-extrabold text-3xl text-green-800">Order: {order?.name}</h3>
            <button
              onClick={() => navigate(`/packer/orders`)}
              className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-200 hover:bg-blue-400 transition-colors shadow-lg"
            >
              <ArrowLongRightIcon className="w-10 h-10 text-blue-800" />
            </button>
          </div>
          {/* Customer and item count */}
          <div className="flex flex-row mb-6 justify-between items-center text-xl">
            <span>
              <span className="font-bold text-gray-800">Customer:</span>
              <span className="font-mono text-green-700 ml-3">
                {order?.customer?.first_name} {order?.customer?.last_name}
              </span>
            </span>
            <div className="bg-green-500 text-white text-lg px-6 py-1 rounded-3xl shadow whitespace-nowrap min-w-[90px] text-center">
              {order?.lineItems?.length} items
            </div>
          </div>
          {/* Notes */}
          {order?.adminNote && (
            <div className="my-4">
              <p className="text-xl font-bold text-red-700">Admin Note: {order.adminNote}</p>
            </div>
          )}
          {order?.orderNote && (
            <div className="my-4">
              <p className="text-xl font-bold text-blue-700">Customer Note: {order.orderNote}</p>
            </div>
          )}
          {/* Barcode section */}
          <div className="mb-5">
            <BarcodeScanner onScan={handleScan}/>
            <BarcodeListener onScan={handleScan} />
            {barcodeStatus && (
              <div className="text-left text-2xl font-semibold text-yellow-600 mt-2">
                {barcodeStatus}
              </div>
            )}
          </div>
          {/* --- Scrollable List Section --- */}
          <div className="flex flex-col gap-6" style={{maxHeight: '65vh', overflowY: 'auto'}}>
            {lineItems.map((item, idx) => {
              // Pick mode or pack mode for the item
              const isPickMode = pickModeIdx === idx;
              return (
                <div 
                key={item.variantId}
                className={`border-2  rounded-2xl p-6 shadow-lg bg-white
                    ${isPickMode
                    ? "border-l-8 border-l-blue-500 border-blue-200"
                    : "border-l-8 border-l-yellow-400 border-yellow-200"
                    }`}
                >
                    <div className="flex flex-row justify-between gap-6"
                    >
                        {/* Left: Image + info */}
                        <div className="flex-1 flex items-start gap-6 min-w-0">
                            <img
                            src={item?.image}
                            alt={item?.productTitle}
                            className="w-32 h-32 sm:w-48 sm:h-48 rounded-2xl object-cover cursor-pointer border-2 border-gray-200"
                            onClick={() => {
                                setEnlargedImage(item?.image);
                                setIsImageOpen(true);
                            }}
                            />
                            <div className="min-w-0">
                            <h3 className="font-bold text-2xl text-gray-900 truncate">
                                {item?.variantInfo?.title === "Default Title"
                                ? item?.productTitle
                                : item?.variantInfo?.title}
                                {(item.adminNote || item.customerNote) && (
                                <span title="This item has notes" className="text-yellow-500 text-2xl ml-2">📌</span>
                                )}
                            </h3>
                            <p className="font-bold text-lg text-gray-900 truncate">Quantity: {item.quantity}</p>
                            <p className="font-bold text-lg text-gray-900 mb-2">SKU: {item?.variantInfo?.sku}</p>
                            <div className="flex gap-2 flex-wrap mt-2 mb-2">
                                {item.pickedStatus?.verified.quantity > 0 && (
                                <span className="bg-green-600 text-white px-4 py-1 rounded-2xl text-lg font-bold">
                                    {item.pickedStatus.verified.quantity} Picked
                                </span>
                                )}
                                {!item?.refund && item.pickedStatus?.outOfStock.quantity > 0 && (
                                <span className="bg-red-600 text-white px-4 py-1 rounded-2xl text-lg font-bold">
                                    {item.pickedStatus.outOfStock.quantity} Out Of Stock
                                </span>
                                )}
                                {!item?.refund &&item.pickedStatus?.damaged.quantity > 0 && (
                                <span className="bg-yellow-500 text-white px-4 py-1 rounded-2xl text-lg font-bold">
                                    {item.pickedStatus.damaged.quantity} Damaged
                                </span>
                                )}
                                {(item.packedStatus?.verified.quantity > 0 ||
                                item.packedStatus?.outOfStock.quantity > 0 ||
                                item.packedStatus?.damaged.quantity > 0) && (
                                <span className="bg-blue-600 text-white px-4 py-1 rounded-2xl text-lg font-bold">
                                    {item.packedStatus.verified.quantity + item.packedStatus.outOfStock.quantity + item.packedStatus.damaged.quantity} Packed
                                </span>
                                )}
                                {item?.refund && (
                                    <span className="bg-red-600 text-white px-4 py-1 rounded-2xl text-lg font-bold">
                                        {item?.pickedStatus?.outOfStock.quantity + item?.pickedStatus?.damaged.quantity} refunded
                                    </span>
                                )}
                            </div>
                            
                            {item.adminNote && (
                                <p className="text-lg text-red-600 font-bold">Admin note: {item.adminNote}</p>
                            )}
                            {item.customerNote && (
                                <p className="text-lg text-blue-600 font-bold">Customer note: {item.customerNote}</p>
                            )}
                            </div>
                        </div>
                        {/* Right: Actions */}
                        <div className="flex flex-col gap-4 items-end min-w-fit">
                            {/* PICK MODE UI */}
                            {isPickMode ? (
                            <>
                                {/* Plus (pick), Minus (remove pick), Flag, Undo */}
                                {!item.picked && 
                                    <>
                                        <button
                                        title="Pick one"
                                        onClick={() => handlePickPlus(item.shopifyLineItemId)}
                                        className="bg-white text-blue-700 border-2 border-blue-500 hover:bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-3xl font-extrabold"
                                        >
                                        <PlusIcon className="w-9 h-9" />
                                        </button>
                                        {item.quantity > 1 &&
                                            <button
                                            title="Remove one pick"
                                            onClick={() => handlePickMinus(item.shopifyLineItemId)}
                                            className="bg-white text-gray-500 border-2 border-gray-400 hover:bg-stone-200 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-3xl font-extrabold"
                                            >
                                            <MinusIcon className="w-9 h-9" />
                                            </button>
                                        }
                                        <button
                                        title="Flag"
                                        onClick={() => openFlagDialog(item)}
                                        className="bg-white text-red-700 border-2 border-red-600 hover:bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-3xl font-extrabold"
                                        >
                                        <FlagIcon className="w-9 h-9" />
                                        </button>
                                    </>
                                }

                                {item.picked &&
                                    <>
                                        <button
                                        title="Undo all"
                                        onClick={() => handlePickUndo(item.shopifyLineItemId)}
                                        className="bg-white text-yellow-600 border-2 border-yellow-600 hover:bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-3xl font-extrabold"
                                        >
                                        <ArrowPathIcon className="w-9 h-9" />
                                        </button>
                                        <button
                                        title="Done Picking"
                                        onClick={cancelPickMode}
                                        className="bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-2xl font-extrabold"
                                        >
                                        <CheckIcon className="w-9 h-9" />
                                        </button>
                                    </>
                                }
                            </>
                            ) : (
                            <>
                                {/* PACK MODE UI */}
                                {!item.refund &&
                                    <>
                                        {item.pickedStatus?.verified.quantity > item.packedStatus?.verified.quantity && (
                                        <button
                                            title="Pack One"
                                            onClick={() => handlePackPlus(item.shopifyLineItemId)}
                                            className="bg-white text-blue-600 border-2 border-blue-600 hover:bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-3xl font-extrabold"
                                        >
                                            {item.quantity > 1 ? (
                                                <PlusIcon className="w-10 h-10" />
                                            ) : (
                                                <CheckIcon className="w-10 h-10" />
                                            )}
                                        </button>
                                        )}
                                        {item.pickedStatus?.verified.quantity <= item.packedStatus?.verified.quantity && item.pickedStatus?.verified.quantity > 0 && (
                                        <button
                                            title="Undo Pack"
                                            onClick={() => handleUndo(item.shopifyLineItemId)}
                                            className="bg-white text-yellow-600 border-2 border-yellow-600 hover:bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-3xl font-extrabold"
                                        >
                                            <ArrowPathIcon className="w-10 h-10" />
                                        </button>
                                        )}
                                        {((item.pickedStatus.damaged.quantity > 0 && !item.pickedStatus.damaged?.subbed) ||
                                            (item.pickedStatus.outOfStock.quantity > 0 && !item.pickedStatus.outOfStock?.subbed)) && 
                                            <button
                                                className="bg-white text-red-600 border-2 border-red-600 hover:bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-3xl font-extrabold"
                                                onClick={() => refundItem(order._id, order.shopifyOrderId, item.shopifyLineItemId, item.quantity)}
                                                title="Refund this item"
                                            >
                                                <CurrencyDollarIcon className="w-10 h-10" />
                                            </button>
                                        }
                                        {!(item.refund || item.subbed) &&
                                            <button
                                                className="bg-white text-blue-400 border-2 border-blue-400 hover:bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-3xl font-extrabold"
                                                onClick={() => handleRePick(idx)}
                                                title="Re-pick this item"
                                            >
                                                <PencilSquareIcon className="w-10 h-10" />
                                            </button>
                                        }
                                    </>
                                }
                            </>
                            )}
                        </div>
                    </div>
                    {/* Substitution */}
                    {item?.substitution?.shopifyVariantId && (
                        <div className="flex flex-col sm:flex-row justify-between border-2 border-yellow-600 rounded-2xl p-4 mt-4 bg-yellow-50">
                            <div className="flex items-start">
                                <img
                                    src={item?.substitution?.image}
                                    alt={item?.substitution?.title}
                                    className="w-24 h-24 sm:w-36 sm:h-36 rounded-xl object-cover cursor-pointer border-2 border-yellow-200"
                                    onClick={() => {
                                        setEnlargedImage(item?.substitution?.image);
                                        setIsImageOpen(true);
                                    }}
                                />
                                <div className="ml-4 mt-2 sm:mt-0">
                                    <h3 className="font-bold text-2xl text-yellow-700">
                                        Subbed: {item?.substitution?.title}
                                    </h3>
                                    <div className="flex gap-2 mt-2 mb-2">
                                        {item?.substitution?.used && (
                                            <span className="text-lg text-white bg-green-500 rounded-2xl px-3 mt-2 sm:mt-0">Verified</span>
                                        )}
                                    </div>
                                    <p className="font-bold text-xl text-gray-900">SKU: {item?.substitution?.sku}</p>
                                </div>
                            </div>
                            <div className="flex justify-end mt-4 space-x-3 sm:flex-col sm:justify-start sm:mt-0 sm:space-x-0 sm:space-y-2">
                                {!isPickMode && !item?.subbed && (
                                    <>
                                        <button
                                            title="Confirm Substitution"
                                            onClick={() => handleConfirmSubstitution(item?.shopifyLineItemId)}
                                            className="w-16 h-16 flex items-center justify-center rounded-2xl  bg-white border-2 border-green-600 text-green-600 hover:bg-green-200 shadow-lg text-3xl transition"
                                        >
                                            <CheckIcon className="w-10 h-10" />
                                        </button>
                                        <button
                                            title="Cancel Substitution"
                                            onClick={() => handleCancelSubstitution(item?.shopifyLineItemId)}
                                            className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white border-2 border-red-600 text-red-600 hover:bg-red-200 shadow-lg text-3xl transition"
                                        >
                                            <XMarkIcon className="w-10 h-10" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
              );
            })}
          </div>
          {/* Confirm Reset Dialog */}
          {confirmResetItemIdx != null && (
            <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
              <div className="bg-white p-8 rounded-2xl shadow-2xl border-2 border-blue-300 max-w-xs">
                <h2 className="font-bold text-2xl mb-4">Reset Picking and Packing?</h2>
                <p className="mb-4">This will reset the picking and packing status for <b>{lineItems[confirmResetItemIdx]?.productTitle}</b>.</p>
                <div className="flex gap-2 mt-4 justify-end">
                  <button className="bg-white border-2 border-gray-400 text-gray-700 px-4 py-2 rounded-2xl font-bold hover:bg-gray-100" onClick={() => setConfirmResetItemIdx(null)}>
                    Cancel
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded-2xl font-bold" onClick={confirmReset}>
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Flag Dialog */}
          {showFlagDialog && flagDialogItem && (
            <FlagDialog
              isOpen={showFlagDialog}
              onClose={() => setShowFlagDialog(false)}
              lineItem={flagDialogItem}
              onSubmit={handleFlagSubmit}
              onSelectSubstitution={handleSubstitutionSelect}
            />
          )}
          {/* Packing Photos */}
          <div className="mt-8 p-6 bg-gray-100 rounded-xl shadow-inner">
            <p className="font-bold text-xl mb-4">Packing Photos</p>
            {capturedPhotos.length === 0 ? (
              <div className="flex justify-center items-center h-48 text-gray-500 text-center">
                Please take a photo for the order
              </div>
            ) : (
              <div className="w-full bg-gray-100 p-4 rounded-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
                  {capturedPhotos.map(({ photoUrl, fileId }, index) => (
                    <div key={fileId || index} className="relative w-full max-w-xs aspect-[4/3] bg-white rounded-md shadow-md overflow-hidden">
                      <img
                        src={photoUrl}
                        alt={`Captured ${index + 1}`}
                        className="w-full h-full object-cover"
                        onClick={() => {
                          setEnlargedImage(photoUrl);
                          setIsImageOpen(true);
                        }}
                      />
                      <button
                        onClick={() => handleDeletePhoto(fileId)}
                        className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-md hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-center mt-6">
              <button
                className="bg-green-500 text-white rounded-md px-6 py-3 hover:bg-green-600 font-bold text-lg"
                onClick={() => setModalOpen(true)}
              >
                Take Photo
              </button>
            </div>
          </div>
          {/* Packing controls */}
          <div className='flex justify-between mt-6 items-center'>
            <div className='flex items-center'>
              <p className='text-xl font-semibold mr-3'>Box Count:</p>
              <Spinbox
                value={boxCount}
                max={10}
                OnValueChange={handBoxCountChange}
              />
            </div>
            <div className='flex space-x-4 items-center'>
              <p className='font-bold text-xl'>Slip</p>
              <button
                className='w-20 h-20 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-800 text-white shadow-lg text-3xl transition'
                title="Print Packing Slip"
                onClick={handlePrintPackingSlip}
              >
                <PrinterIcon className='w-10 h-10'/>
              </button>
              <p className='font-bold text-xl'>Label</p>
              <button
                className='w-20 h-20 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-800 text-white shadow-lg text-3xl transition'
                title="Print Box Labels"
                onClick={handlePrintDeliveryLabel}
              >
                <PrinterIcon className='w-10 h-10'/>
              </button>
            </div>
          </div>
          {/* Submit Button */}
          <button
            disabled={!allPacked}
            className={`w-full mt-8 rounded-2xl p-6 font-extrabold text-3xl shadow-xl transition-all
              ${allPacked
                ? 'bg-blue-600 hover:bg-blue-800 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
            `}
            onClick={handleCompletePacking}
          >
            Complete Packing
          </button>
        </div>
        <ImageZoomModal
          isOpen={isImageOpen}
          onClose={() => setIsImageOpen(false)}
          imageUrl={enlargedImage}
        />
        <CameraModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onCaptureComplete={handleUpload}
        />
      </div>
    </Layout>
  );
}