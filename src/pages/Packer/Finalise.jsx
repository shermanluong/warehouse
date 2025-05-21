import Layout from '../../layouts/layout';
import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { 
    PlusIcon, 
    MinusIcon, 
    CheckIcon,
    ArrowPathIcon,
    CurrencyDollarIcon,
    XMarkIcon,
    PrinterIcon,
    ArrowLongRightIcon
} from '@heroicons/react/24/outline'
import axios from 'axios';
import dataURLToFile from '../../utils/dataURLToFile';
import BarcodeScanner from '../../components/BarcodeScanner';
import BarcodeListener from '../../components/BarcodeListener';
import CameraModal from '../../components/CameraModal';
import ImageZoomModal from '../../components/ImageZoomModal';
import Spinbox from '../../components/Spinbox';
import SwitchButton from '../../components/SwitchButton';
import FlagDialog from '../../components/FlagDialog'
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

    //Image Modal
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState('');
    
    const [boxCount, setBoxCount] = useState(0);
    const [allPacked, setAllPacked] = useState(false);
    const [isPickingMode, setIsPickingMode] = useState(false);
    const { setLoading } = useLoading();
    const token = localStorage.getItem("token");

    const [showDialog, setShowDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

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
                {headers:{Authorization:`Bearer ${token}`}}
            );
            console.log(res?.data);
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

    // --- Picking Logic ---
    const handlePickPlus = async (shopifyLineItemId) => {
        await patchOrder(`/picker/order/${order._id}/pick-plus`, { shopifyLineItemId });
    };
    const handlePickMinus = async (shopifyLineItemId) => {
        await patchOrder(`/picker/order/${order._id}/pick-minus`, { shopifyLineItemId });
    };
    const handlePickUndo = async (shopifyLineItemId) => {
        await patchOrder(`/picker/order/${order._id}/undo-item`, { shopifyLineItemId });
    };

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

    // --- Flagging & Substitution (Picker) ---
    const openFlagDialog = (item) => {
        setSelectedItem(item);
        setShowDialog(true);
    };
    const handleFlagSubmit = async ({ shopifyLineItemId, reason, quantity }) => {
        await patchOrder(`/picker/order/${order._id}/pick-flag`, { shopifyLineItemId, reason, quantity });
        setShowDialog(false);
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
        setShowDialog(false);
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

    // --- UI Render ---
    return (
        <Layout headerTitle={"Packing"}>
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
                    {/* Switch */}
                    <div className='mb-4'>
                        <SwitchButton 
                            isChecked={isPickingMode}
                            OnValueChange={() => setIsPickingMode(!isPickingMode)}
                        />
                    </div>
                    {/* Line Item Cards */}
                    <div className="flex flex-col gap-6">
                        {lineItems.map((lineItem) => (
                            <div key={lineItem.variantId} className="border-2 border-gray-200 rounded-2xl p-6 shadow-lg bg-white">
                                <div className="flex flex-col sm:flex-row justify-between gap-6">
                                    {/* Left: image + name + SKU */}
                                    <div className="flex items-start">
                                        <img
                                            src={lineItem?.image}
                                            alt={lineItem?.productTitle}
                                            className="w-32 h-32 sm:w-48 sm:h-48 rounded-2xl object-cover cursor-pointer"
                                            onClick={() => {
                                                setEnlargedImage(lineItem?.image);
                                                setIsImageOpen(true);
                                            }}
                                        />
                                        <div className="ml-4 mt-2 sm:mt-0">
                                            <h3 className="font-bold text-2xl text-gray-900">
                                                {lineItem?.variantInfo?.title === "Default Title"
                                                    ? lineItem?.productTitle
                                                    : lineItem?.variantInfo?.title}
                                                {(lineItem.adminNote || lineItem.customerNote) && (
                                                    <span title="This item has notes" className="text-yellow-500 text-2xl ml-2">📌</span>
                                                )}
                                            </h3>
                                            {/* Packing Mode */}
                                            {!isPickingMode && (
                                                <>
                                                    <div className="flex flex-col gap-2 mt-2 mb-2 items-start">
                                                        {lineItem?.pickedStatus?.verified.quantity > 0 && (
                                                            <div className='flex flex-col items-start gap-5 sm:flex-row sm:items-center'>
                                                                <p className="text-lg text-white bg-green-500 rounded-2xl px-4 py-1">
                                                                    {lineItem?.packedStatus?.verified.quantity} packed / {lineItem?.pickedStatus?.verified.quantity} picked
                                                                </p>
                                                            </div>
                                                        )}
                                                        {!lineItem?.refund && lineItem?.pickedStatus?.outOfStock.quantity > 0 && (
                                                            <p className="text-lg text-white bg-red-500 rounded-2xl px-4 py-1">
                                                                {lineItem?.pickedStatus?.outOfStock.quantity} Out Of Stock
                                                            </p>
                                                        )}
                                                        {!lineItem?.refund && lineItem?.pickedStatus?.damaged.quantity > 0 && (
                                                            <p className="text-lg text-white bg-red-500 rounded-2xl px-4 py-1">
                                                                {lineItem?.pickedStatus?.damaged.quantity} Damaged
                                                            </p>
                                                        )}
                                                        {lineItem?.refund && (
                                                            <p className="text-lg text-white bg-red-500 rounded-2xl px-4 py-1">
                                                                {lineItem?.pickedStatus?.outOfStock.quantity + lineItem?.pickedStatus?.damaged.quantity} refunded
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-xl text-gray-900">
                                                        {lineItem?.packedStatus?.verified.quantity +
                                                            lineItem?.packedStatus?.damaged.quantity +
                                                            lineItem?.packedStatus?.outOfStock.quantity} packed / {lineItem?.quantity} units
                                                    </span>
                                                </>
                                            )}
                                            {/* Picking Mode */}
                                            {isPickingMode && !lineItem.refund && (
                                                <>
                                                    <div className="flex gap-2 mt-2 mb-2 flex-wrap">
                                                        {lineItem?.pickedStatus?.verified.quantity > 0 && (
                                                            <p className="text-lg text-white bg-green-500 rounded-2xl px-4 py-1">
                                                                {lineItem?.pickedStatus?.verified.quantity} picked
                                                            </p>
                                                        )}
                                                        {lineItem?.pickedStatus?.outOfStock.quantity > 0 && (
                                                            <p className="text-lg text-white bg-red-500 rounded-2xl px-4 py-1">
                                                                {lineItem?.pickedStatus?.outOfStock.quantity} Out Of Stock
                                                            </p>
                                                        )}
                                                        {lineItem?.pickedStatus?.damaged.quantity > 0 && (
                                                            <p className="text-lg text-white bg-red-500 rounded-2xl px-4 py-1">
                                                                {lineItem?.pickedStatus?.damaged.quantity} Damaged
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-xl text-gray-900">
                                                        {lineItem?.pickedStatus?.verified.quantity +
                                                            lineItem?.pickedStatus?.damaged.quantity +
                                                            lineItem?.pickedStatus?.outOfStock.quantity} picked / {lineItem?.quantity} units
                                                    </span>
                                                    <p className="font-bold text-xl text-gray-900">SKU: {lineItem?.variantInfo?.sku}</p>
                                                </>
                                            )}
                                            {/* Notes */}
                                            {lineItem.adminNote && (
                                                <p className="text-lg text-red-600 mt-2 font-bold">Admin note: {lineItem.adminNote}</p>
                                            )}
                                            {lineItem.customerNote && (
                                                <p className="text-lg text-blue-600 mt-2 font-bold">Customer note: {lineItem.customerNote}</p>
                                            )}
                                        </div>
                                    </div>
                                    {/* Right: Action Buttons */}
                                    <div className="flex justify-end mt-6 space-x-4 sm:flex-col sm:justify-start sm:items-end sm:mt-0 sm:space-x-0 sm:space-y-3">
                                        {/* Packing Mode */}
                                        {!isPickingMode && !lineItem.refund && (
                                            <>
                                                {lineItem.pickedStatus.verified.quantity === lineItem.packedStatus.verified.quantity && lineItem?.packedStatus?.verified.quantity !== 0 && 
                                                    <button
                                                        title="Undo" 
                                                        onClick={() => handleUndo(lineItem.shopifyLineItemId)}
                                                        className="w-20 h-20 flex items-center justify-center rounded-full bg-white border-2 border-blue-400 text-blue-400 hover:bg-blue-200 shadow-lg text-3xl transition"
                                                    >
                                                        <ArrowPathIcon className="w-10 h-10" />
                                                    </button>
                                                }
                                                {lineItem?.packedStatus?.verified.quantity === 0 && lineItem?.pickedStatus?.verified.quantity === 1 &&
                                                    <button
                                                        title="Pack item"
                                                        onClick={() => handlePackPlus(lineItem.shopifyLineItemId)}
                                                        className="w-20 h-20 flex items-center justify-center rounded-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-200 shadow-lg text-3xl transition"
                                                    >
                                                        <CheckIcon className="w-10 h-10" />
                                                    </button>
                                                }
                                                {lineItem?.packedStatus?.verified.quantity < lineItem?.pickedStatus?.verified.quantity && lineItem?.pickedStatus?.verified.quantity !== 1 &&
                                                    <>
                                                        <button
                                                            title="Add one Item"
                                                            onClick={() => handlePackPlus(lineItem.shopifyLineItemId)}
                                                            className="w-20 h-20 flex items-center justify-center rounded-full bg-white border-2 border-blue-400 text-blue-400 hover:bg-blue-200 shadow-lg text-3xl transition"
                                                        >
                                                            <PlusIcon className="w-10 h-10" />
                                                        </button>
                                                        <button
                                                            title="Remove one Item"
                                                            onClick={() => handlePackMinus(lineItem.shopifyLineItemId)}
                                                            className="w-20 h-20 flex items-center justify-center rounded-full bg-white border-2 border-stone-400 text-stone-400 hover:bg-stone-200 shadow-lg text-3xl transition"
                                                        >
                                                            <MinusIcon className="w-10 h-10" />
                                                        </button>
                                                    </>
                                                }
                                                {((lineItem.pickedStatus.damaged.quantity > 0 && !lineItem.pickedStatus.damaged?.subbed) ||
                                                    (lineItem.pickedStatus.outOfStock.quantity > 0 && !lineItem.pickedStatus.outOfStock?.subbed)) && 
                                                    <button
                                                        title="Refund" 
                                                        onClick={() => refundItem(order._id, order.shopifyOrderId, lineItem.shopifyLineItemId, lineItem.quantity)}
                                                        className="w-20 h-20 flex items-center justify-center rounded-full bg-white border-2 border-green-400 text-green-400 hover:bg-green-200 shadow-lg text-3xl transition"
                                                    >
                                                        <CurrencyDollarIcon className="w-10 h-10" />
                                                    </button>
                                                }
                                            </>
                                        )}
                                        {/* Picking Mode */}
                                        {isPickingMode && !lineItem.refund && (
                                            <>
                                                {!lineItem.picked && lineItem.quantity <= 1 &&
                                                    <button
                                                        title="Pick item"
                                                        onClick={() => handlePickPlus(lineItem.shopifyLineItemId)}
                                                        className="w-20 h-20 flex items-center justify-center rounded-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-200 shadow-lg text-3xl transition"
                                                    >
                                                        <CheckIcon className="w-10 h-10" />
                                                    </button>
                                                }
                                                {!lineItem.picked && lineItem.quantity > 1 &&
                                                    <>
                                                        <button
                                                            title="Add one Item"
                                                            onClick={() => handlePickPlus(lineItem.shopifyLineItemId)}
                                                            className="w-20 h-20 flex items-center justify-center rounded-full bg-white border-2 border-blue-400 text-blue-400 hover:bg-blue-200 shadow-lg text-3xl transition"
                                                        >
                                                            <PlusIcon className="w-10 h-10" />
                                                        </button>
                                                        <button
                                                            title="Remove one Item"
                                                            onClick={() => handlePickMinus(lineItem.shopifyLineItemId)}
                                                            className="w-20 h-20 flex items-center justify-center rounded-full bg-white border-2 border-stone-400 text-stone-400 hover:bg-stone-200 shadow-lg text-3xl transition"
                                                        >
                                                            <MinusIcon className="w-10 h-10" />
                                                        </button>
                                                    </>
                                                }
                                                {!lineItem.picked &&
                                                    <button 
                                                        title="Flag Item"
                                                        onClick={() => openFlagDialog(lineItem)}
                                                        className="w-20 h-20 flex items-center justify-center rounded-full bg-white border-2 border-red-600 text-red-600 hover:bg-red-200 shadow-lg text-3xl transition"
                                                    >
                                                        <XMarkIcon className="w-10 h-10" />
                                                    </button>
                                                }
                                                {lineItem.picked &&
                                                    <button
                                                        title="Undo" 
                                                        onClick={() => handlePickUndo(lineItem.shopifyLineItemId)}
                                                        className="w-20 h-20 flex items-center justify-center rounded-full bg-white border-2 border-blue-400 text-blue-400 hover:bg-blue-200 shadow-lg text-3xl transition"
                                                    >
                                                        <ArrowPathIcon className="w-10 h-10" />
                                                    </button>
                                                }
                                            </>
                                        )}
                                    </div>
                                </div>
                                {/* Substitution */}
                                {lineItem?.substitution?.shopifyVariantId && (
                                    <div className="flex flex-col sm:flex-row justify-between border-2 border-yellow-600 rounded-2xl p-4 mt-4 bg-yellow-50">
                                        <div className="flex items-start">
                                            <img
                                                src={lineItem?.substitution?.image}
                                                alt={lineItem?.substitution?.title}
                                                className="w-24 h-24 sm:w-36 sm:h-36 rounded-xl object-cover cursor-pointer border-2 border-yellow-200"
                                                onClick={() => {
                                                    setEnlargedImage(lineItem?.substitution?.image);
                                                    setIsImageOpen(true);
                                                }}
                                            />
                                            <div className="ml-4 mt-2 sm:mt-0">
                                                <h3 className="font-bold text-2xl text-yellow-700">
                                                    Subbed: {lineItem?.substitution?.title}
                                                </h3>
                                                <div className="flex gap-2 mt-2 mb-2">
                                                    {lineItem?.substitution?.used && (
                                                        <span className="text-lg text-white bg-green-500 rounded-2xl px-3 mt-2 sm:mt-0">Verified</span>
                                                    )}
                                                </div>
                                                <p className="font-bold text-xl text-gray-900">SKU: {lineItem?.substitution?.sku}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-4 space-x-3 sm:flex-col sm:justify-start sm:mt-0 sm:space-x-0 sm:space-y-2">
                                            {!isPickingMode && !lineItem?.subbed && (
                                                <>
                                                    <button
                                                        title="Confirm Substitution"
                                                        onClick={() => handleConfirmSubstitution(lineItem?.shopifyLineItemId)}
                                                        className="w-20 h-20 flex items-center justify-center rounded-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-200 shadow-lg text-3xl transition"
                                                    >
                                                        <CheckIcon className="w-10 h-10" />
                                                    </button>
                                                    <button
                                                        title="Cancel Substitution"
                                                        onClick={() => handleCancelSubstitution(lineItem?.shopifyLineItemId)}
                                                        className="w-20 h-20 flex items-center justify-center rounded-full bg-white border-2 border-red-600 text-red-600 hover:bg-red-200 shadow-lg text-3xl transition"
                                                    >
                                                        <XMarkIcon className="w-10 h-10" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
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
                {/* Modals and dialogs */}
                {showDialog && selectedItem && (
                    <FlagDialog
                        isOpen={showDialog}
                        onClose={() => setShowDialog(false)}
                        lineItem={selectedItem}
                        onSubmit={handleFlagSubmit}
                        onSelectSubstitution={handleSubstitutionSelect}
                    />
                )}
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
    )
}