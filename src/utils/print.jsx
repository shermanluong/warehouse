// utils/print.js

import jsPDF from "jspdf";

// Function to generate Packing Slip
export const generatePackingSlip = (order) => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "normal");

    doc.setFontSize(16);
    doc.text("Packing Slip", 20, 20);

    doc.setFontSize(12);
    doc.text(`Order Id: ${order.name}`, 20, 30);
    doc.text(`Customer Name: ${order.customer.first_name} ${order.customer.last_name}`, 20, 40);
    doc.text(`Address: ${order.customer.default_address.address1}`, 20, 50);

    let yPosition = 60;
    order.lineItems.forEach((lineItem) => {
        doc.text(`Product: ${lineItem.productTitle}`, 20, yPosition);
        doc.text(`Quantity: ${lineItem.quantity}`, 150, yPosition);
        yPosition += 10;
    });

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
}

// Function to generate 100x150mm Delivery Label
export const generateDeliveryLabel = (order, boxCount) => {
    const doc = new jsPDF({
        unit: "mm",
        format: [100, 150]
    });

    for (let i =0; i < boxCount; i++ ) {
        if ( i > 0 ) doc.addPage(); //Add a new page for each label

        doc.setFont("helvetica", "normal");

        doc.setFontSize(14);
        doc.text(`Driver: ${order.delivery.driverName}`, 10, 20);

        doc.setFontSize(12);
        doc.text(`Route: ${order.delivery.tripId}`, 10, 30);

        doc.setFontSize(10);
        doc.text(`Address: ${order.customer.default_address.address1}`, 10, 40);

        doc.text(`Box 1 of 6`, 10, 50);
    }
    
    //Automatically print all labels.
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
}
