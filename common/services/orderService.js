const orderDao = require('../dao/orderDao');

const getAllOrders = async () => {
    const result = await orderDao.getAllOrders();
    const orderMap = new Map();

    result.recordset.forEach((row) => {
        const { orderId, poNumber, orderStatus } = row;

        if (!orderMap.has(orderId)) {
            orderMap.set(orderId, {
                orderId,
                poNumber,
                orderStatus,
                orderDetails: [],
                invoice: row.invoiceId ? {
                    invoiceId: row.invoiceId,
                    invoiceDate: row.invoiceDate,
                    invoiceStatus: row.invoiceStatus,
                    invoiceDetails: []
                } : null
            });
        }

        const order = orderMap.get(orderId);
        
        if (row.orderDetailProductId) {
            order.orderDetails.push({
                quantity: row.orderDetailQuantity,
                price: row.orderDetailPrice,
                product: {
                    productId: row.orderDetailProductId,
                    productCode: row.orderDetailProductCode,
                    productName: row.orderDetailProductName
                }
            });
        }

        if (row.invoiceId && row.invoiceDetailProductId) {
            order.invoice.invoiceDetails.push({
                quantity: row.invoiceDetailQuantity,
                price: row.invoiceDetailPrice,
                product: {
                    productId: row.invoiceDetailProductId,
                    productCode: row.invoiceDetailProductCode,
                    productName: row.invoiceDetailProductName
                }
            });
        }
    });
    
    return [...orderMap.values()];
};

module.exports = {
    getAllOrders,
}; 