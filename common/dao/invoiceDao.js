const { executeQuery } = require("../utils/dbUtils");

const createInvoice = async (orderId, transaction = null) => {
  const query = `
        INSERT INTO dbo.INVOICE ( ORDER_ID, INVOICE_STATUS, INVOICE_DATE)
        OUTPUT INSERTED.INVOICE_ID
        SELECT 
            @orderId,
            'Billed',
            GETDATE()
        FROM dbo.[ORDER]
        WHERE ORDER_ID = @orderId
        AND ORDER_STATUS = 'Fulfilled'
        AND NOT EXISTS (
            SELECT 1 FROM dbo.INVOICE WHERE ORDER_ID = @orderId
        );
    `;
  return await executeQuery(query, { orderId }, transaction);
};

const createInvoiceDetails = async (invoiceId, orderId, transaction = null) => {
  const query = `
        INSERT INTO dbo.INVOICE_DETAILS (INVOICE, PRODUCT_ID, QUANTITY, PRICE)
        SELECT 
            @invoiceId,
            od.PRODUCT_ID,
            od.QUANTITY,
            od.PRICE
        FROM dbo.ORDER_DETAILS od
        WHERE od.ORDER_ID = @orderId;
    `;
  return await executeQuery(query, { invoiceId, orderId }, transaction);
};

module.exports = {
  createInvoice,
  createInvoiceDetails,
};
