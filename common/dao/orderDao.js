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

const getNextPoNumber = async (transaction = null) => {
  const query = `
    SELECT ISNULL(MAX(CAST(SUBSTRING(PO_NUMBER, 4, 5) AS INT)), 0) + 1 as nextNumber
    FROM dbo.[ORDER]
    WHERE PO_NUMBER LIKE 'PO-%';
  `;
  const result = await executeQuery(query, {}, transaction);
  const nextNumber = result.recordset[0].nextNumber;
  return `PO-${nextNumber.toString().padStart(5, "0")}`;
};

const createOrder = async (order, transaction = null) => {
  const query = `
      INSERT INTO dbo.[ORDER] (PO_NUMBER, ORDER_STATUS, CUSTOMER_ID, USER_ID, DATE_CREATED)
      OUTPUT INSERTED.ORDER_ID
      VALUES (@poNumber, @orderStatus, @customerId, @userId, @dateCreated);
    `;
  return await executeQuery(query, order, transaction);
};

const insertOrderDetails = async (
  orderId,
  orderDetails,
  transaction = null
) => {
  const valuePlaceholders = orderDetails
    .map(
      (_, index) =>
        `(@orderId, @productId_${index}, @quantity_${index}, @price_${index})`
    )
    .join(", ");

  const query = `
    INSERT INTO dbo.ORDER_DETAILS (ORDER_ID, PRODUCT_ID, QUANTITY, PRICE)
    VALUES ${valuePlaceholders};
  `;

  const params = {
    orderId,
    ...orderDetails.reduce(
      (params, detail, index) => ({
        ...params,
        [`productId_${index}`]: detail.productId,
        [`quantity_${index}`]: detail.quantity,
        [`price_${index}`]: detail.price,
      }),
      {}
    ),
  };

  await executeQuery(query, params, transaction);
};

const getOrdersWithFilters = async (filters) => {
  const { status, startDate, endDate, page = 1, pageSize = 10 } = filters;

  const offset = (page - 1) * pageSize;

  const countQuery = `
    SELECT COUNT(*) as totalCount
    FROM dbo.[ORDER] o
    WHERE 1=1
      ${status ? "AND o.ORDER_STATUS = @status" : ""}
      ${startDate ? "AND o.DATE_CREATED >= @startDate" : ""}
      ${endDate ? "AND o.DATE_CREATED <= @endDate" : ""}
  `;

  const countResult = await executeQuery(countQuery, {
    ...(status && { status }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  });

  const totalCount = countResult.recordset[0].totalCount;

  const query = `
    WITH FilteredOrders AS (
      SELECT 
        o.ORDER_ID,
        o.ORDER_STATUS,
        o.CUSTOMER_ID,
        o.DATE_CREATED
      FROM 
        dbo.[ORDER] o
      WHERE 1=1
        ${status ? "AND o.ORDER_STATUS = @status" : ""}
        ${startDate ? "AND o.DATE_CREATED >= @startDate" : ""}
        ${endDate ? "AND o.DATE_CREATED <= @endDate" : ""}
      ORDER BY 
        o.DATE_CREATED DESC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    )
    SELECT 
      fo.ORDER_ID AS orderId,
      fo.ORDER_STATUS AS status,
      fo.CUSTOMER_ID AS customerId,
      fo.DATE_CREATED AS createdDate,
      SUM(od.QUANTITY * od.PRICE) AS totalCost
    FROM 
      FilteredOrders fo
    LEFT JOIN 
      dbo.ORDER_DETAILS od ON fo.ORDER_ID = od.ORDER_ID
    GROUP BY 
      fo.ORDER_ID, fo.ORDER_STATUS, fo.CUSTOMER_ID, fo.DATE_CREATED
    ORDER BY 
      fo.ORDER_ID DESC;
  `;

  const params = {
    ...(status && { status }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    offset,
    pageSize,
  };

  const result = await executeQuery(query, params);
  return {
    ...result,
    totalCount,
    currentPage: page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
};

const getOrderById = async (orderId) => {
  return await executeQuery(
    `
    SELECT 
      o.ORDER_ID AS orderId,
      o.ORDER_STATUS AS status,
      o.CUSTOMER_ID AS customerId,
      o.DATE_CREATED AS createdDate,
      od.QUANTITY AS quantity,
      od.PRICE AS price,
      p.PRODUCT_ID AS productId
    FROM 
      dbo.[ORDER] o
    LEFT JOIN 
      dbo.ORDER_DETAILS od ON o.ORDER_ID = od.ORDER_ID
    LEFT JOIN
      dbo.PRODUCT p ON od.PRODUCT_ID = p.PRODUCT_ID
    WHERE 
      o.ORDER_ID = @orderId;
    `,
    { orderId }
  );
};

const updateOrderStatus = async (orderId, status, transaction = null) => {
  const query = `
        UPDATE dbo.[ORDER]
        SET ORDER_STATUS = @status
        WHERE ORDER_ID = @orderId;
    `;
  return await executeQuery(query, { orderId, status }, transaction);
};

module.exports = {
  getAllOrders,
  createOrder,
  insertOrderDetails,
  getOrdersWithFilters,
  getOrderById,
  updateOrderStatus,
  getNextPoNumber,
}; 