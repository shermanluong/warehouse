import jsPDF from 'jspdf';

const getImageDataUrl = async (imageUrl) => {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

export const generatePackingSlip = async (order) => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  const addHeader = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("RITA'S FARM PRODUCE", 20, yPosition);

    doc.setFontSize(12);
    doc.text(`Order ${order.name}`, 160, yPosition);

    yPosition += 10;
    doc.text(`${order.customer.first_name} ${order.customer.last_name}`, 20, yPosition);
    yPosition += 10;
    doc.text(`${order.customer.default_address.address1}`, 20, yPosition);
    yPosition += 10;
    doc.text(`${order.customer.default_address.city}, ${order.customer.default_address.zip}`, 20, yPosition);
    yPosition += 10;
    doc.text(`${order.customer.default_address.country}`, 20, yPosition);
    yPosition += 10;
    if ( order.customer.default_address.phone ) {
        doc.text(`${order.customer.default_address.phone}`, 20, yPosition);
        yPosition += 10;
    }

    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text("ITEMS", 20, yPosition);
    doc.text(`QUANTITY`, 165, yPosition);
    yPosition += 10;
  };

  addHeader();

  for (const lineItem of order.lineItems) {
    const itemHeight = lineItem.image ? 15 : 10;

    // Page break logic
    if (yPosition + itemHeight > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }

    doc.text(`${lineItem.productTitle}`, 40, yPosition + 5);
    doc.text(`${lineItem.quantity}`, 180, yPosition + 5);

    try {
      if (lineItem.image) {
        const base64Image = await getImageDataUrl(lineItem.image);
        doc.addImage(base64Image, 'JPEG', 20, yPosition - 2, 15, 15);
      } 
      doc.rect(20, yPosition - 2, 15, 15);
      yPosition += 20;
    } catch (err) {
      console.warn(`Failed to load image for ${lineItem.productTitle}`, err);
      yPosition += 10;
    }
  }

  // Footer message
  if (yPosition + 20 > pageHeight - 20) {
    doc.addPage();
    yPosition = 20;
  }
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10
  doc.text("Thank you for shopping with us!", 72, yPosition);
  yPosition += 10
  doc.text("Rita's Farm Produce", 80, yPosition);
  yPosition += 10
  doc.text("1204 Mamre Road, Kemps Creek NSW 2178, Australia", 53, yPosition);
  yPosition += 10
  doc.text("hello@ritasfarmproduce.com.au", 75, yPosition);
  yPosition += 10
  doc.text("www.ritasfarm.com.au", 80, yPosition);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};

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
      doc.text(`${order.customer.first_name} ${order.customer.last_name}`, 5, 20);
  
      // Stop Number
      doc.setFontSize(160);
      doc.text(`${order.delivery.stopNumber}`, 20, 70);
  
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
  
  
