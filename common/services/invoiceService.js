const invoiceDao = require("../dao/invoiceDao");
const orderDao = require("../dao/orderDao");
const { executeTransaction } = require("../utils/dbUtils");

const createInvoiceFromOrder = async (orderId) => {
  try {
    const result = await executeTransaction(async (transaction) => {
      const invoiceResult = await invoiceDao.createInvoice(
        orderId,
        transaction
      );

      if (!invoiceResult.recordset || invoiceResult.recordset.length === 0) {
        throw new Error(
          `Could not create invoice for order ${orderId}. Either the order is not in 'Fulfilled' status, or an invoice already exists.`
        );
      }

      const invoiceId = invoiceResult.recordset[0].INVOICE_ID;

      await invoiceDao.createInvoiceDetails(invoiceId, orderId, transaction);

      await orderDao.updateOrderStatus(orderId, "Billed", transaction);

      const orderDetails = await orderDao.getOrderById(orderId);
      const totalCost = orderDetails.recordset.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      return {
        invoiceId: `INV-${invoiceId.toString().padStart(5, "0")}`,
        status: "Billed",
        totalCost: parseFloat(totalCost.toFixed(2)),
      };
    });

    return result;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw new Error(`Error creating invoice: ${error.message}`);
  }
};

module.exports = {
  createInvoiceFromOrder,
};
