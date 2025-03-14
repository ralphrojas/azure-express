const { executeQuery } = require('../utils/dbUtils');

const getAllOrders = async () => {
    return await executeQuery(`
       SELECT 
            o.ORDER_ID AS orderId,
            o.PO_NUMBER AS poNumber,
            o.ORDER_STATUS AS orderStatus,

            od.QUANTITY AS orderDetailQuantity,
            od.PRICE AS orderDetailPrice,
            p.PRODUCT_ID AS orderDetailProductId,
            p.PRODUCT_CODE AS orderDetailProductCode,
            p.NAME AS orderDetailProductName,

            i.INVOICE_ID AS invoiceId,
            i.INVOICE_DATE AS invoiceDate,
            i.INVOICE_STATUS AS invoiceStatus,

            id.QUANTITY AS invoiceDetailQuantity,
            id.PRICE AS invoiceDetailPrice,
            ip.PRODUCT_ID AS invoiceDetailProductId,
            ip.PRODUCT_CODE AS invoiceDetailProductCode,
            ip.NAME AS invoiceDetailProductName

        FROM 
            dbo.[ORDER] o
        LEFT JOIN 
            dbo.ORDER_DETAILS od ON o.ORDER_ID = od.ORDER_ID
        LEFT JOIN 
            dbo.PRODUCT p ON od.PRODUCT_ID = p.PRODUCT_ID
        LEFT JOIN 
            dbo.INVOICE_DETAILS id ON od.PRODUCT_ID = id.PRODUCT_ID
        LEFT JOIN 
            dbo.INVOICE i ON id.INVOICE = i.INVOICE_ID
        LEFT JOIN 
            dbo.PRODUCT ip ON id.PRODUCT_ID = ip.PRODUCT_ID

        ORDER BY 
            o.ORDER_ID, i.INVOICE_ID;
    `);
};

module.exports = {
    getAllOrders
}; 