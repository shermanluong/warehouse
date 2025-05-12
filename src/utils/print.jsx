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
      doc.text(`${order.delivery.driverName}`, 15, 90);
  
      // Box Count with rectangle
      const boxText = `${i + 1}`;
      doc.setFontSize(60);
      const x = 70;
      const y = 95;
      doc.text(boxText, x, y);
  
      // Draw rectangle around the box count
      const textWidth = doc.getTextWidth(boxText);
      const textHeight = 60 * 0.35; // Rough height estimate
      const paddingX = 4;
      const paddingY = 4;
  
      doc.rect(
        x - paddingX,
        y - textHeight - paddingY,
        textWidth + paddingX * 2,
        textHeight + paddingY * 2
      );
  
      // Address
      doc.setFontSize(8);
      doc.text(
        `${order.customer.default_address.address1}, ${order.customer.default_address.city}, ${order.customer.default_address.province}, ${order.customer.default_address.zip}, ${order.customer.default_address.country}`,
        5,
        120
      );
    }
  
    // Automatically print all labels
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
};
  
