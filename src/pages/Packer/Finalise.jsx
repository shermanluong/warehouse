import Layout from '../../layouts/layout';
import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from "react";
import { 
    PlusIcon, 
    MinusIcon, 
    CheckIcon,
    CameraIcon,
    PencilSquareIcon,
    ArrowPathIcon,
    CurrencyDollarIcon,
    XMarkIcon,
    PrinterIcon
} from '@heroicons/react/24/outline'
import axios from 'axios';
import dataURLToFile from '../../utils/dataURLToFile';
import BarcodeScanner from '../../components/BarcodeScanner';
import CameraModal from '../../components/CameraModal';
import ImageZoomModal from '../../components/ImageZoomModal';
import Spinbox from '../../components/Spinbox';
import SwitchButton from '../../components/SwitchButton';
import FlagDialog from '../../components/FlagDialog'
import { generatePackingSlip, generateDeliveryLabel } from '../../utils/print'; // Adjust the path if necessary

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
    const [isPickingMode, setIsPickingMode] = useState(false);
    const token = localStorage.getItem("token");

    
    useEffect(() => {
        fetchOrder();
    }, [id]);

    useEffect(() => {
        setAllPacked(lineItems.every(
            item => item.packed
        ));
    }, [lineItems]);

    const handleDeletePhoto = async (fileIdToDelete) => {
        try {
          await axios.delete(`${import.meta.env.VITE_API_URL}/packer/order/${order._id}/delete-photo`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { fileId: fileIdToDelete },
          });
      
          setCapturedPhotos(photos => 
            photos.filter(photo => photo.fileId !== fileIdToDelete)
          );
      
          console.log('Photo deleted successfully:', fileIdToDelete);
        } catch (error) {
          console.error('Error deleting photo:', error);
          alert('Failed to delete photo. Please try again.');
        }
    };

    const handleUpload = async (image) => {
        const file = dataURLToFile(image, `order-photo-${Date.now()}.jpg`);

        const res = await axios.post(`${import.meta.env.VITE_API_URL}/upload/image`, {
            fileBase64: image,
            fileName: file.name
        });
        
        const imageUrl = res.data.url;
        const fileId = res.data.fileId;

        await axios.patch(
            `${import.meta.env.VITE_API_URL}/packer/order/${order._id}/save-photo`, 
            {
                photoUrl: imageUrl,
                fileId: fileId,
            },
            {headers:{Authorization:`Bearer ${token}`}}
        );
        
        setCapturedPhotos(prev => [...prev, { photoUrl: imageUrl, fileId }]);
    };

    const fetchOrder = async () => {
        const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/packer/order/${id}`, 
            {headers:{Authorization:`Bearer ${token}`}}
        );
        setOrder(res?.data || null);
        setLineItems(res?.data?.lineItems);
        setCapturedPhotos(res?.data?.photos || []);
        console.log(res?.data);
    };

    const handlePackPlus = async (shopifyLineItemId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/packer/order/${order._id}/pack-plus`,
                { shopifyLineItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
        } catch (err) {
            console.error('Failed to pick plus', err);
        }
    };

    const handlePackMinus = async (shopifyLineItemId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/packer/order/${order._id}/pack-minus`,
                { shopifyLineItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
        } catch (err) {
            console.error('Failed to pick minus', err);
        }
    };

    const handleUndo = async (shopifyLineItemId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/packer/order/${order._id}/undo-item`,
                { shopifyLineItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
        } catch (err) {
            console.error('Failed to undo', err);
        }
    };

    const handleCancelSubstitution = async (shopifyLineItemId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/packer/order/${order._id}/cancel-sub-item`,
                { shopifyLineItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
        } catch (err) {
            console.error('Failed to cancel substitution item', err);
        }
    };

    const handleConfirmSubstitution = async (shopifyLineItemId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/packer/order/${order._id}/confirm-sub-item`,
                { shopifyLineItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
        } catch (err) {
            console.error('Failed to confirm substitution item', err);
        }
    };

    const refundItem = async (id, shopifyOrderId, shopifyLineItemId, quantity) => {
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/packer/refund-item`,
                { 
                    id,
                    shopifyOrderId,
                    shopifyLineItemId,
                    quantity 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
        } catch (err) {
            console.error('Failed to confirm substitution item', err);
        }
    };

    const handleScan = async (barcode) => {
        const scannedItem = lineItems.find(
            (item) => item.variantInfo?.barcode === barcode
        );

        if (!scannedItem) {
            setBarcodeStatus("No matching item found for the scanned barcode.");
        } else if (scannedItem.packed) {
            setBarcodeStatus("This item is already packed.");
        } else {
            try {
                await axios.patch(
                    `${import.meta.env.VITE_API_URL}/packer/order/${order._id}/pack-plus`,
                    { shopifyLineItemId: scannedItem.shopifyLineItemId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setBarcodeStatus(`Successfully packed: ${scannedItem.productTitle}`);
                fetchOrder();
            } catch (err) {
                console.error("Failed to update packing status:", err);
                setBarcodeStatus("Failed to update packing status.");
            }
        }
    
        setTimeout(() => setBarcodeStatus(""), 2000);
    };
    
    const handBoxCountChange = (newValue) => {
        setBoxCount(newValue);
    }

    const handlePrint = (pdfDoc) => {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print</title></head><body>');
        printWindow.document.write(pdfDoc.output('datauristring'));
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    const handlePrintPackingSlip = () => {
        //handlePrint(generatePackingSlip(order));
        generatePackingSlip(order);
    };

    const handlePrintDeliveryLabel = () => {
        //handlePrint(generateDeliveryLabel(order, boxCount));
        generateDeliveryLabel(order, boxCount);
    };

    const handleCompletePacking = async () => {
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/packer/order/${order._id}/complete-packing`, 
                {
                    boxCount
                },
                { headers: { Authorization: `Bearer ${token}` } 
            });
            navigate(`/packer/orders`);
        } catch (err) {
          console.error(err?.response?.data?.message);
        }
    };

    const handleChangeMode = () => {
        setIsPickingMode(!isPickingMode);
    }

    const handlePickUndo = async (shopifyLineItemId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/undo-item`,
                { shopifyLineItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
        } catch (err) {
            console.error('Failed to undo', err);
        }
    };

    const handlePickPlus = async (shopifyLineItemId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-plus`,
                { shopifyLineItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
        } catch (err) {
            console.error('Failed to pick plus', err);
        }
    };

    const handlePickMinus = async (shopifyLineItemId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-minus`,
                { shopifyLineItemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            fetchOrder();
        } catch (err) {
            console.error('Failed to pick minus', err);
        }
    };

    const [showDialog, setShowDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const openFlagDialog = (item) => {
        setSelectedItem(item);
        setShowDialog(true);
    };

    const handleFlagSubmit = async ({ shopifyLineItemId, reason, quantity }) => {
        await axios.patch(
            `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-flag`,
            { 
                shopifyLineItemId   : shopifyLineItemId,
                reason   : reason,
                quantity  : quantity 
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        fetchOrder();
    };

    const handleSubstitutionSelect = async ({
        shopifyLineItemId,
        reason,
        quantity,
        subbedProductId,
        subbedVariantId,
      }) => {
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/picker/order/${order._id}/pick-substitute`,
          {
            shopifyLineItemId, 
            reason,
            quantity,
            subbedProductId,
            subbedVariantId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      
        fetchOrder();
    };

    return (
        <Layout headerTitle={"Packing"}>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Your content */}
                <div className="bg-white p-4 rounded-sm shadow-md">
                    {/* Header */}
                    <div className="flex flex-row mb-4 justify-between">
                        <h3 className="font-semibold text-3xl">Order: {order?.name}</h3>
                        <button 
                            onClick={() => navigate(`/packer/orders`)}
                            className="px-4 rounded-md hover:bg-blue-300"
                        >
                            Back to list
                        </button>
                    </div>

                    <div className="flex flex-row mb-4 justify-between text-xl">
                        <p>Customer: 
                            <span className="font-mono text-gray-700 ml-2">
                                {order?.customer?.first_name} {order?.customer?.last_name}
                            </span>
                        </p>
                        <div className="bg-green-400 px-3 rounded-2xl">{order?.lineItems?.length} items</div>
                    </div>

                    {order?.adminNote && (
                        <div className="my-3">
                            <p className="text-sm font-semibold text-red-600">Admin Note: {order.adminNote}</p>
                        </div>
                    )}
                        
                    {order?.orderNote && (
                        <div className="my-3">
                            <p className="text-sm font-semibold text-red-600">Customer Note: {order.orderNote}</p>
                        </div>
                    )}

                    <BarcodeScanner 
                        OnScan={handleScan}
                    />

                    <p className='mb-2'>Scanned Barcode: {barcodeStatus}</p>
                    
                    <div className='mb-2'>
                        <SwitchButton 
                            isChecked = {isPickingMode}
                            OnValueChange={handleChangeMode}
                        />
                    </div>
                    
                    {/* Cards */}
                    <div className="flex flex-col gap-4">
                        {lineItems.map((lineItem) => (
                            <div key={lineItem.variantId} className = "border border-gray-200 rounded-lg p-4 shadow-md">
                                <div className="flex flex-col sm:flex-row  justify-between ">
                                    {/* Left side: image + name + SKU */}
                                    <div className="flex items-start">
                                        <img
                                            src={lineItem?.image}
                                            alt={lineItem?.productTitle}
                                            className="w-48 h-48 rounded object-cover"
                                            onClick = {() => {
                                                setEnlargedImage(lineItem?.image);
                                                setIsImageOpen(true);
                                            }}
                                        />
                                        <div className="ml-4 mt-2 sm:mt-0">
                                            <h3 className="font-semibold text-2xl text-gray-900">
                                            {lineItem?.variantInfo?.title === "Default Title"
                                                ? lineItem?.productTitle
                                                : lineItem?.variantInfo?.title}
                                    
                                            {(lineItem.adminNote || lineItem.customerNote) && (
                                                <span title="This item has notes" className="text-yellow-500 text-2xl ml-2">📌</span>
                                            )}
                                            </h3>
                                            {/*Packing mode */}
                                            {!isPickingMode && 
                                                <>
                                                    <div className="flex flex-col gap-1 mt-2 mb-2 items-start">
                                                        {lineItem?.pickedStatus?.verified.quantity > 0 && (
                                                            <div className='flex flex-col items-start gap-5 sm:flex-row sm:items-center'>
                                                                <p className="text-xl text-white bg-green-500 rounded-2xl px-3 mt-2 sm:mt-0">
                                                                    {lineItem?.packedStatus?.verified.quantity} packed / {lineItem?.pickedStatus?.verified.quantity} picked
                                                                </p>
                                                            </div>
                                                        )}

                                                        {!lineItem?.refund && lineItem?.pickedStatus?.outOfStock.quantity > 0 && (
                                                            <p className="text-lg text-white bg-red-500 rounded-2xl px-3 mt-2 sm:mt-0">
                                                                {lineItem?.pickedStatus?.outOfStock.quantity} Out Of Stock
                                                            </p>
                                                        )}

                                                        {!lineItem?.refund && lineItem?.pickedStatus?.damaged.quantity > 0 && (
                                                            <p className="text-lg text-white bg-red-500 rounded-2xl px-3 mt-2 sm:mt-0">
                                                                {lineItem?.pickedStatus?.damaged.quantity} Damaged
                                                            </p>
                                                        )}

                                                        {lineItem?.refund && (
                                                            <p className="text-lg text-white bg-red-500 rounded-2xl px-3 mt-2 sm:mt-0">
                                                                {lineItem?.pickedStatus?.outOfStock.quantity + lineItem?.pickedStatus?.damaged.quantity} refunded
                                                            </p>
                                                        )}
                                                    </div>

                                                    <span className="font-semibold text-xl text-gray-900">
                                                        { 
                                                            lineItem?.packedStatus?.verified.quantity 
                                                            +
                                                            lineItem?.packedStatus?.damaged.quantity 
                                                            +
                                                            lineItem?.packedStatus?.outOfStock.quantity 
                                                        } packed / {lineItem?.quantity} units
                                                    </span>
                                                </>
                                            }
                                            {/*Picking mode */}
                                            {isPickingMode && !lineItem.refund && 
                                                <>
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
                                                    <span className="font-semibold text-xl text-gray-900">
                                                        { 
                                                            lineItem?.pickedStatus?.verified.quantity 
                                                            +
                                                            lineItem?.pickedStatus?.damaged.quantity 
                                                            +
                                                            lineItem?.pickedStatus?.outOfStock.quantity 
                                                        } picked / {lineItem?.quantity} units
                                                    </span>
                                                    <p className="font-semibold text-xl text-gray-900">SKU: {lineItem?.variantInfo?.sku}</p>
                                                </>
                                            }

                                            {/* Show notes if any */}
                                            {lineItem.adminNote && (
                                                <p className="text-xl text-red-600 mt-1">Admin note: {lineItem.adminNote}</p>
                                            )}
                                            {lineItem.customerNote && (
                                                <p className="text-xl text-blue-600 mt-1">Customer note: {lineItem.customerNote}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-4 space-x-3 sm:flex-col sm:justify-start sm:items-end sm:mt-0 sm:space-x-0 sm:space-y-2 ">
                                        
                                        {/*Packing Mode */}
                                        { !isPickingMode && !lineItem.refund && 
                                            <>
                                                {lineItem.pickedStatus.verified.quantity === lineItem.packedStatus.verified.quantity && lineItem?.packedStatus?.verified.quantity !== 0 && 
                                                    <button
                                                        title="Undo" 
                                                        onClick={() => handleUndo(lineItem.shopifyLineItemId)}
                                                        className="bg-white text-blue-400 border border-blue-400 hover:bg-blue-200 w-16 h-16 rounded flex items-center justify-center"
                                                    >
                                                        <ArrowPathIcon className="w-10 h-10" />
                                                    </button>
                                                }
                                                
                                                {lineItem?.packedStatus?.verified.quantity === 0 && lineItem?.pickedStatus?.verified.quantity === 1 &&
                                                    <button
                                                        title = "Pack item"
                                                        onClick={() => handlePackPlus(lineItem.shopifyLineItemId)}
                                                        className="bg-white text-green-600 border border-green-600 hover:bg-green-200 w-16 h-16 rounded flex items-center justify-center"
                                                    >
                                                        <CheckIcon className="w-10 h-10" />
                                                    </button>
                                                }

                                                {lineItem?.packedStatus?.verified.quantity < lineItem?.pickedStatus?.verified.quantity && lineItem?.pickedStatus?.verified.quantity != 1 &&
                                                    <>
                                                        <button
                                                            title="Add one Item"
                                                            onClick={() => handlePackPlus(lineItem.shopifyLineItemId)}
                                                            className="bg-white text-blue-400 border border-blue-400 hover:bg-blue-200 w-16 h-16 rounded flex items-center justify-center"
                                                        >
                                                            <PlusIcon className="w-10 h-10" />
                                                        </button>
                                                        <button
                                                            title="remove one Item"
                                                            onClick={() => handlePackMinus(lineItem.shopifyLineItemId)}
                                                            className="bg-white text-stone-400 border border-stone-400 hover:bg-stone-200 w-16 h-16 rounded flex items-center justify-center"
                                                        >
                                                            <MinusIcon className="w-10 h-10" />
                                                        </button>
                                                    </>
                                                }
                                                {  ((lineItem.pickedStatus.damaged.quantity > 0 && !lineItem.pickedStatus.damaged?.subbed) ||
                                                    (lineItem.pickedStatus.outOfStock.quantity > 0 && !lineItem.pickedStatus.outOfStock?.subbed)) && 
                                                    <button
                                                        title = "Refund" 
                                                        onClick={() => refundItem(order._id, order.shopifyOrderId, lineItem.shopifyLineItemId, lineItem.quantity)}
                                                        className="bg-white text-green-400 border border-green-400 hover:bg-green-200 w-16 h-16 rounded flex items-center justify-center"
                                                    >
                                                        <CurrencyDollarIcon className="w-10 h-10" />
                                                    </button>
                                                }
                                            </>
                                        }

                                        {/*Picking Mode */}
                                        {isPickingMode && !lineItem.refund  && 
                                            <>
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
                                                        onClick={() => handlePickUndo(lineItem.shopifyLineItemId)}
                                                        className="bg-white text-blue-400 border border-blue-400 hover:bg-blue-200 w-16 h-16 rounded flex items-center justify-center"
                                                    >
                                                        <ArrowPathIcon className="w-10 h-10" />
                                                    </button>
                                                }
                                            </>
                                        }
                                    </div>
                                </div>

                                {lineItem?.substitution?.shopifyVariantId && 
                                    <div
                                        className="flex flex-col sm:flex-row justify-between border border-yellow-600 rounded-lg p-4 mt-4"
                                    >
                                        {/* Left side: image + name + SKU */}
                                        <div className="flex items-start">
                                            <img
                                                src={lineItem?.substitution?.image}
                                                alt={lineItem?.substitution?.title}
                                                className="w-36 h-36 rounded object-cover"
                                                onClick = {() => {
                                                    setEnlargedImage(lineItem?.substitution?.image);
                                                    setIsImageOpen(true);
                                                }}
                                            />
                                            <div className="ml-4 mt-2 sm:mt-0">
                                                <h3 className="font-semibold text-2xl text-yellow-600">
                                                    Subbed: {lineItem?.substitution?.title}
                                                </h3>

                                                <div className="flex gap-2 mt-2 mb-2">
                                                    {lineItem?.substitution?.used && (
                                                        <span className="text-lg text-white bg-green-500 rounded-2xl px-3 mt-2 sm:mt-0">Verified</span>
                                                    )}
                                                </div>

                                                <p className="font-semibold text-xl text-gray-900">SKU: {lineItem?.substitution?.sku}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-end mt-4 space-x-3 sm:flex-col sm:justify-start sm:mt-0 sm:space-x-0 sm:space-y-2 ">
                                            {!isPickingMode && !lineItem?.subbed && (
                                                <>
                                                    <button
                                                        title = "Confirm Substitution"
                                                        onClick={() => handleConfirmSubstitution(lineItem?.shopifyLineItemId)}
                                                        className="bg-white text-green-600 border border-green-600 hover:bg-green-200 w-16 h-16 rounded flex items-center justify-center"
                                                    >
                                                        <CheckIcon className="w-10 h-10" />
                                                    </button>
                                                    <button
                                                        title = "Cancel Substitution" 
                                                        onClick={() => handleCancelSubstitution(lineItem?.shopifyLineItemId)}
                                                        className="bg-white text-red-600 border border-red-600 hover:bg-red-200 w-16 h-16 rounded flex items-center justify-center"
                                                    >
                                                        <XMarkIcon className="w-10 h-10" />
                                                    </button>
                                                </>   
                                            )}
                                        </div>
                                    </div>  
                                }
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                        <p className="font-semibold text-lg mb-4">Packing Photos</p>

                        {/* If there are no photos */}
                        {capturedPhotos.length === 0 ? (
                            <div className="flex justify-center items-center h-48 text-gray-500 text-center">
                            Please take a photo for the order
                            </div>
                        ) : (
                            <div className="w-full bg-gray-100 p-4 rounded-md">
                                {capturedPhotos.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
                                    {capturedPhotos.map(({ photoUrl, fileId }, index) => (
                                        <div key={fileId || index} className="relative w-full max-w-xs aspect-[4/3] bg-white rounded-md shadow-md overflow-hidden">
                                        <img
                                            src={photoUrl}
                                            alt={`Captured ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onClick = {() => {
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
                                ) : (
                                    <div className="flex items-center justify-center h-48">
                                    <p className="text-gray-500 text-center">Please take a photo for the order</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-center mt-6">
                            <button
                            className="bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-600"
                            onClick={() => setModalOpen(true)}
                            >
                            Take Photo
                            </button>
                        </div>
                    </div>

                    <div className='flex justify-between mt-3'>
                        <div className='flex items-center'>
                            <p className='text-xl font-semibold mr-2'>Box Count:</p>
                            <Spinbox
                            value={boxCount}
                            max={10}
                            OnValueChange={handBoxCountChange}
                            />
                        </div>
                        <div className='flex space-x-3 items-center'>
                            <p className='font-semibold text-xl'>Slip</p>
                            <button
                                className='px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md'
                                title="Print Packing Slip"
                                onClick={handlePrintPackingSlip}
                            >
                                <PrinterIcon className='w-8 h-8'/>
                            </button>
                            <p className='font-semibold text-xl'>Label</p>
                            <button
                                className='px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md'
                                title="Print Box Labels"
                                onClick={handlePrintDeliveryLabel}
                            >
                                <PrinterIcon className='w-8 h-8'/>
                            </button>
                        </div>
                    </div>
                    
                    {/* Submit Button */}
                    <button
                        disabled={!allPacked} 
                        className={`w-full mt-4 rounded-sm p-2 
                            ${allPacked 
                                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                        `}
                        onClick={handleCompletePacking}
                    >
                        Complete Packing
                    </button>
                </div>
            </div>
            {showDialog && selectedItem && (
                <FlagDialog
                    isOpen={showDialog}
                    onClose={() => setShowDialog(false)}
                    lineItem={selectedItem}
                    onSubmit={handleFlagSubmit}
                    onSelectSubstitution= {handleSubstitutionSelect}
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
        </Layout>     
    )
}
