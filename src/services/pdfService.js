const PDFDocument = require('pdfkit');
const fs = require('fs');

function construirPDF(factura, pathDestino) {
    // 1. Configuración inicial del documento
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(fs.createWriteStream(pathDestino));

    // Definimos colores que usaremos (inspirados en tu diseño)
    const colorPrimario = '#4a90e2'; // Azul similar al del prototipo
    const colorTexto = '#333333';
    const colorGrisClaro = '#f5f5f5';

    // ==========================================
    // 2. ENCABEZADO (Logo y Título)
    // ==========================================
    
    // Parte Izquierda: "Logo" y nombre de tu empresa (simulado con texto)
    doc.fillColor(colorPrimario)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('NexoDigital', 50, 45, { align: 'left' }); // Nombre de la APP/Empresa emisora

    // Parte Derecha: Título "FACTURA" y detalles principales
    doc.fillColor(colorTexto)
       .fontSize(20)
       .text('FACTURA', 400, 45, { align: 'right' }); // Título alineado a la derecha

    doc.fontSize(10).font('Helvetica');
    // Detalles alineados bajo el título "FACTURA"
    const startYRight = 75;
    doc.text(`NÚMERO: ${factura.numero}`, 300, startYRight, { align: 'right' });
    
    // Formateamos la fecha para que se vea bonita (DD/MM/YYYY)
    const fechaEmision = new Date(factura.fecha_emision).toLocaleDateString('es-ES');
    doc.text(`FECHA: ${fechaEmision}`, 300, startYRight + 15, { align: 'right' });

    if (factura.fecha_vencimiento) {
        const fechaVenc = new Date(factura.fecha_vencimiento).toLocaleDateString('es-ES');
        doc.fillColor('#e74c3c') // Rojo para destacar vencimiento
           .text(`VENCIMIENTO: ${fechaVenc}`, 300, startYRight + 30, { align: 'right' });
    }
    
    doc.fillColor(colorTexto); // Volvemos al color normal

    // Línea separadora decorativa
    doc.moveDown(2); // Espacio vertical
    doc.moveTo(50, 120).lineTo(550, 120).strokeColor('#eeeeee').stroke();


    // ==========================================
    // 3. INFORMACIÓN DE CLIENTE Y EMPRESA
    // ==========================================
    const yInfo = 140;

    // --- COLUMNA IZQUIERDA: DATOS DE LA EMPRESA (EMISOR) ---
    const empresa = factura.empresa_id; // Datos reales de la empresa

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#888888').text('DE:', 50, yInfo);
    
    // Nombre de la empresa
    doc.fillColor(colorTexto).fontSize(11).text(empresa.nombre, 50, yInfo + 15);
    
    // Dirección y Email
    doc.font('Helvetica').fontSize(10).text(empresa.direccion || 'Dirección no disponible', 50, yInfo + 30);
    doc.text(empresa.email, 50, yInfo + 45);
    doc.text(`CIF/NIF: ${empresa.cif_nif}`, 50, yInfo + 60); // Añadimos el CIF también

    // --- COLUMNA DERECHA: DATOS DEL CLIENTE (RECEPTOR) ---
    const cliente = factura.cliente_id; // Datos reales del cliente

    doc.font('Helvetica-Bold').fillColor('#888888').text('FACTURAR A:', 300, yInfo);
    
    // Verificamos que existan datos del cliente por si acaso se borró
    const nombreCliente = cliente ? cliente.nombre : 'Cliente Eliminado';
    const emailCliente = cliente ? cliente.email : '';
    const cifCliente = cliente ? cliente.cif_nif : '';
    const dirCliente = cliente ? cliente.direccion : '';

    doc.fillColor(colorTexto).fontSize(11).text(nombreCliente, 300, yInfo + 15);
    doc.font('Helvetica').fontSize(10).text(dirCliente, 300, yInfo + 30);
    doc.text(emailCliente, 300, yInfo + 45);
    if(cifCliente) doc.text(`NIF: ${cifCliente}`, 300, yInfo + 60);


    // ==========================================
    // 4. TABLA DE PRODUCTOS
    // ==========================================
    let y = 220; // Posición vertical donde empieza la tabla

    // Cabecera de la tabla (Fondo gris o azul suave)
    doc.rect(50, y, 500, 25).fill(colorGrisClaro); // Caja de fondo
    doc.fillColor(colorTexto).font('Helvetica-Bold').fontSize(9);
    
    // Títulos de columnas
    doc.text('DESCRIPCIÓN', 60, y + 8);
    doc.text('CANT.', 280, y + 8, { width: 40, align: 'center' });
    doc.text('PRECIO', 350, y + 8, { width: 60, align: 'right' });
    doc.text('TOTAL', 480, y + 8, { width: 60, align: 'right' });

    // Filas de productos
    y += 35; // Bajamos para empezar a escribir items
    doc.font('Helvetica').fontSize(10);

    factura.items.forEach(item => {
        // Descripción
        doc.text(item.concepto, 60, y);
        
        // Cantidad
        doc.text(item.cantidad.toString(), 280, y, { width: 40, align: 'center' });
        
        // Precio Unitario (formateado con 2 decimales y símbolo €)
        doc.text(item.precio_unitario.toFixed(2) + ' €', 350, y, { width: 60, align: 'right' });
        
        // Subtotal
        doc.text(item.subtotal.toFixed(2) + ' €', 480, y, { width: 60, align: 'right' });

        // Línea sutil debajo de cada item
        doc.moveTo(50, y + 15).lineTo(550, y + 15).strokeColor('#eeeeee').stroke();
        
        y += 25; // Espacio para la siguiente fila
    });


    // ==========================================
    // 5. TOTALES (Parte Inferior Derecha)
    // ==========================================
    const yTotales = y + 20;

    // Subtotal
    doc.font('Helvetica').fillColor('#888888').text('Subtotal', 350, yTotales, { width: 90, align: 'right' });
    doc.fillColor(colorTexto).text(factura.subtotal.toFixed(2) + ' €', 450, yTotales, { width: 90, align: 'right' });

    // IVA (calculado automáticamente si no viene en el objeto)
    const ivaCalculado = factura.iva_amount || (factura.subtotal * 0.21);
    doc.font('Helvetica').fillColor('#888888').text('IVA (21%)', 350, yTotales + 15, { width: 90, align: 'right' });
    doc.fillColor(colorTexto).text(ivaCalculado.toFixed(2) + ' €', 450, yTotales + 15, { width: 90, align: 'right' });

    // TOTAL GRANDE (Fondo azul para destacar)
    doc.rect(350, yTotales + 40, 190, 30).fill(colorPrimario); // Caja azul
    doc.fillColor('white').font('Helvetica-Bold').fontSize(12);
    doc.text('TOTAL', 360, yTotales + 48); // Texto "TOTAL" dentro de la caja
    doc.text(factura.total.toFixed(2) + ' €', 450, yTotales + 48, { width: 80, align: 'right' }); // Cantidad final


    // ==========================================
    // 6. PIE DE PÁGINA (Footer)
    // ==========================================
    doc.fontSize(8).fillColor('#aaaaaa');
    const bottomY = doc.page.height - 50;
    
    // Línea separadora final
    doc.moveTo(50, bottomY - 15).lineTo(550, bottomY - 15).strokeColor('#eeeeee').stroke();
    
    // Texto legal o agradecimiento
    doc.text('Gracias por su confianza. Para cualquier duda contacte con administración.', 50, bottomY, { align: 'center', width: 500 });
    doc.text('Pago mediante transferencia bancaria.', 50, bottomY + 10, { align: 'center', width: 500 });

    // Finalizar documento
    doc.end();
}

module.exports = { construirPDF };