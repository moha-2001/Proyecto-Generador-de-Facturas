const PDFDocument = require('pdfkit');
const fs = require('fs');

function construirPDF(factura, pathDestino) {
    // 1. Crear el documento
    const doc = new PDFDocument({ margin: 50 });

    // 2. Guardarlo en el disco duro
    doc.pipe(fs.createWriteStream(pathDestino));

    // --- DISEÑO DE LA FACTURA ---

    // Cabecera
    doc.fontSize(20).text('FACTURA', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Número: ${factura.numero}`);
    doc.text(`Fecha: ${factura.fecha_emision.toISOString().split('T')[0]}`);
    doc.text(`Estado: ${factura.estado}`);
    doc.moveDown();

    // Línea separadora
    doc.moveTo(50, 200).lineTo(550, 200).stroke();
    doc.moveDown();

    // Listado de productos (Items)
    doc.fontSize(14).text('Detalle de Productos:', 50, 220);
    doc.moveDown();

    let yPosition = 250;
    factura.items.forEach(item => {
        doc.fontSize(12)
           .text(item.concepto, 50, yPosition)
           .text(`${item.cantidad} x ${item.precio_unitario}€`, 300, yPosition)
           .text(`${item.subtotal}€`, 450, yPosition, { align: 'right' });
        
        yPosition += 20;
    });

    // Totales
    doc.moveTo(50, yPosition + 10).lineTo(550, yPosition + 10).stroke();
    doc.fontSize(14).text(`Total a Pagar: ${factura.total}€`, 350, yPosition + 30, { align: 'right' });

    // 3. Finalizar PDF
    doc.end();
}

module.exports = { construirPDF };