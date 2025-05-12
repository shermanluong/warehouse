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
  
    for (let i = 0; i < boxCount; i++) {
      if (i > 0) doc.addPage(); // Add a new page for each label
  
      doc.setFont("helvetica", "bold");
  
      // Customer Name
      doc.setFontSize(24);
      doc.text(`${order.customer.first_name} ${order.customer.last_name}`, 10, 20);
  
      // Stop Number
      doc.setFontSize(100);
      doc.text(`${order.delivery.stopNumber}`, 30, 60);
  
      // Driver Name
      doc.setFontSize(12);
      const driverY = 90;
      doc.text(`${order.delivery.driverName}`, 15, driverY);
  
      // Box Count with rectangle
      const boxText = `${i + 1}/${boxCount}`;
      doc.setFontSize(40);
      const x = 70;
      const y = driverY + 2; // Raise or lower to center align with driver text
      const textWidth = doc.getTextWidth(boxText);
      const textHeight = 40 * 0.35;
      const paddingX = 3;
      const paddingY = 3;
  
      // Draw rectangle
      doc.rect(
        x - paddingX,
        y - textHeight - paddingY,
        textWidth + paddingX * 2,
        textHeight + paddingY * 2
      );
  
      doc.text(boxText, x, y);
  
      // Address
      doc.setFontSize(8);
      const address = order.customer.default_address;
      doc.text(
        `${address.address1}, ${address.city}, ${address.province}, ${address.zip}, ${address.country}`,
        5,
        110
      );

      doc.setFontSize(20);
      doc.text(
        `${order.name}`,
        40,
        125
      );
    }
  
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
};
  
  
