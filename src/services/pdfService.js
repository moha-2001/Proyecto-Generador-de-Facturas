const PDFDocument = require('pdfkit');
const fs = require('fs');

function construirPDF(factura, pathDestino) {
    // 1. Configuración inicial del documento
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(fs.createWriteStream(pathDestino));

    // Definimos colores
    const colorPrimario = '#4a90e2'; // Azul corporativo
    const colorTexto = '#333333';
    const colorGrisClaro = '#f5f5f5';
    // 2. ENCABEZADO (Bajamos Y de 45 a 60 para dar aire)
    const startYHeader = 60; 
    doc.fillColor(colorPrimario)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('NexoDigital', 50, startYHeader, { align: 'left' });
    doc.fillColor(colorTexto)
       .fontSize(20)
       .text('FACTURA', 400, startYHeader, { align: 'right' });
    doc.fontSize(10).font('Helvetica');
    const startYDetails = startYHeader + 30; // 90 aprox
    doc.text(`NÚMERO: ${factura.numero}`, 300, startYDetails, { align: 'right' });
    const fechaEmision = new Date(factura.fecha_emision).toLocaleDateString('es-ES');
    doc.text(`FECHA: ${fechaEmision}`, 300, startYDetails + 15, { align: 'right' });

    // VENCIMIENTO
    if (factura.fecha_vencimiento) {
        const fechaVenc = new Date(factura.fecha_vencimiento).toLocaleDateString('es-ES');
        doc.fillColor('#e74c3c')
           .text(`VENCIMIENTO: ${fechaVenc}`, 300, startYDetails + 30, { align: 'right' });
    }
    // ESTADO (PAGADA / PENDIENTE)
    const colorEstado = factura.estado === 'Pagada' ? '#2ecc71' : '#e67e22';
    const textoEstado = factura.estado ? factura.estado.toUpperCase() : 'PENDIENTE';
    // Dibujamos recuadro estado
    const yEstado = startYDetails + 50;
    doc.rect(450, yEstado, 100, 20).fill(colorEstado);
    doc.fillColor('white')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(textoEstado, 450, yEstado + 5, { width: 100, align: 'center' }); // +5 para centrar verticalmente
    doc.fillColor(colorTexto);
    // LÍNEA SEPARADORA
    const yLinea = yEstado + 40; // Bajamos más la línea (aprox 180)
    doc.moveDown(2);
    doc.moveTo(50, yLinea).lineTo(550, yLinea).strokeColor('#eeeeee').stroke();

    // 3. INFORMACIÓN CLIENTE / EMPRESA
    const yInfo = yLinea + 25; 
    const empresa = factura.empresa_id;
    const cliente = factura.cliente_id;
    // COLUMNA IZQUIERDA (EMPRESA)
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#888888').text('DE:', 50, yInfo);
    doc.fillColor(colorTexto).fontSize(11).text(empresa.nombre, 50, yInfo + 15);
    doc.font('Helvetica').fontSize(10);
    doc.text(empresa.direccion || '', 50, yInfo + 30);
    doc.text(empresa.email, 50, yInfo + 45);
    doc.text(`CIF/NIF: ${empresa.cif_nif}`, 50, yInfo + 60);
    // COLUMNA DERECHA (CLIENTE)
    doc.font('Helvetica-Bold').fillColor('#888888').text('FACTURAR A:', 300, yInfo);
    const nombreCliente = cliente ? cliente.nombre : 'Cliente Eliminado';
    const emailCliente = cliente ? cliente.email : '';
    const cifCliente = cliente ? cliente.cif_nif : '';
    const dirCliente = cliente ? cliente.direccion : '';
    doc.fillColor(colorTexto).fontSize(11).text(nombreCliente, 300, yInfo + 15);
    doc.font('Helvetica').fontSize(10);
    doc.text(dirCliente, 300, yInfo + 30);
    doc.text(emailCliente, 300, yInfo + 45);
    if(cifCliente) doc.text(`NIF: ${cifCliente}`, 300, yInfo + 60);

    // 4. TABLA DE PRODUCTOS
    let y = yInfo + 100; 
    doc.rect(50, y, 500, 25).fill(colorGrisClaro);
    doc.fillColor(colorTexto).font('Helvetica-Bold').fontSize(9);
    doc.text('DESCRIPCIÓN', 60, y + 8);
    doc.text('CANT.', 280, y + 8, { width: 40, align: 'center' });
    doc.text('PRECIO', 350, y + 8, { width: 60, align: 'right' });
    doc.text('TOTAL', 480, y + 8, { width: 60, align: 'right' });
    y += 35;
    doc.font('Helvetica').fontSize(10);
    factura.items.forEach(item => {
        // Descripción
        doc.text(item.concepto || item.descripcion || 'Item', 60, y); // Aseguramos que pinte algo si concepto falla
        doc.text(item.cantidad.toString(), 280, y, { width: 40, align: 'center' });
        doc.text(item.precio_unitario.toFixed(2) + ' €', 350, y, { width: 60, align: 'right' });
        doc.text(item.subtotal.toFixed(2) + ' €', 480, y, { width: 60, align: 'right' });
        doc.moveTo(50, y + 15).lineTo(550, y + 15).strokeColor('#eeeeee').stroke();
        y += 25;
    });
    // 5. TOTALES
    const yTotales = y + 20;
    doc.font('Helvetica').fillColor('#888888').text('Subtotal', 350, yTotales, { width: 90, align: 'right' });
    doc.fillColor(colorTexto).text(factura.subtotal.toFixed(2) + ' €', 450, yTotales, { width: 90, align: 'right' });
    const ivaCalculado = factura.iva_amount || (factura.subtotal * 0.21);
    doc.font('Helvetica').fillColor('#888888').text('IVA (21%)', 350, yTotales + 15, { width: 90, align: 'right' });
    doc.fillColor(colorTexto).text(ivaCalculado.toFixed(2) + ' €', 450, yTotales + 15, { width: 90, align: 'right' });
    // CAJA TOTAL GRANDE
    doc.rect(350, yTotales + 40, 190, 30).fill(colorPrimario);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(12);
    doc.text('TOTAL', 360, yTotales + 48);
    doc.text(factura.total.toFixed(2) + ' €', 450, yTotales + 48, { width: 80, align: 'right' });
    // 6. PIE DE PÁGINA (Footer Fijo)
    const bottomY = 750; 
    doc.fontSize(8).fillColor('#aaaaaa');
    doc.moveTo(50, bottomY - 15).lineTo(550, bottomY - 15).strokeColor('#eeeeee').stroke();
    doc.text('Gracias por su confianza. Para cualquier duda contacte con administración.', 50, bottomY, {
        width: 500, align: 'center'
    });
    doc.text('Pago mediante transferencia bancaria.', 50, bottomY + 12, {
        width: 500, align: 'center'
    });
    doc.end();
}

module.exports = { construirPDF };