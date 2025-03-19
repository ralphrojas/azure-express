const orderDao = require('../dao/orderDao');
const { executeTransaction } = require("../utils/dbUtils");
const productService = require("./productService");

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
        invoice: row.invoiceId
          ? {
              invoiceId: row.invoiceId,
              invoiceDate: row.invoiceDate,
              invoiceStatus: row.invoiceStatus,
              invoiceDetails: [],
            }
          : null,
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
          productName: row.orderDetailProductName,
        },
      });
    }

    if (row.invoiceId && row.invoiceDetailProductId) {
      order.invoice.invoiceDetails.push({
        quantity: row.invoiceDetailQuantity,
        price: row.invoiceDetailPrice,
        product: {
          productId: row.invoiceDetailProductId,
          productCode: row.invoiceDetailProductCode,
          productName: row.invoiceDetailProductName,
        },
      });
    }
  });

  return [...orderMap.values()];
};

const createOrder = async (order) => {
  const { customerId, items, userId } = order;
  const dateCreated = new Date();
  const defaultStatus = "Pending";

  try {
    const itemsWithPrice = await productService.getProductPrices(items);
    const totalCost = itemsWithPrice.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const result = await executeTransaction(async (transaction) => {
      const poNumber = await orderDao.getNextPoNumber(transaction);
      const orderResult = await orderDao.createOrder(
        {
          poNumber,
          orderStatus: defaultStatus,
          customerId,
          userId,
          dateCreated,
        },
        transaction
      );

      const orderId = orderResult.recordset[0].ORDER_ID;
      await orderDao.insertOrderDetails(orderId, itemsWithPrice, transaction);

      return { orderId, totalCost, status: defaultStatus };
    });

    return result;
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error(error.message);
  }
};

const getOrdersWithFilters = async (filters) => {
  try {
    const { orderStatus, startDate, endDate, page, pageSize } = filters;

    if (startDate && isNaN(Date.parse(startDate))) {
      throw new Error("Invalid start date format");
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      throw new Error("Invalid end date format");
    }

    const result = await orderDao.getOrdersWithFilters({
      status: orderStatus,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 10,
    });

    return {
      orders: result.recordset.map((order) => ({
        orderId: order.orderId,
        status: order.status,
        customerId: order.customerId,
        totalCost: parseFloat(order.totalCost || 0).toFixed(2),
        createdDate: new Date(order.createdDate).toISOString().split("T")[0],
      })),
      pagination: {
        totalCount: result.totalCount,
        currentPage: result.currentPage,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    };
  } catch (error) {
    console.error("Error getting filtered orders:", error);
    throw new Error(error.message);
  }
};

const getOrderById = async (orderId) => {
  try {
    const result = await orderDao.getOrderById(orderId);
    if (!result.recordset || result.recordset.length === 0) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    const firstRow = result.recordset[0];
    const items = result.recordset
      .filter((row) => row.productId)
      .map((row) => ({
        productId: row.productId,
        quantity: row.quantity,
        price: parseFloat(row.price).toFixed(2),
      }));

    const totalCost = items
      .reduce((sum, item) => sum + item.quantity * item.price, 0)
      .toFixed(2);

    return {
      orderId: firstRow.orderId,
      status: firstRow.status,
      customerId: firstRow.customerId,
      items,
      totalCost,
      createdDate: new Date(firstRow.createdDate).toISOString().split("T")[0],
    };
  } catch (error) {
    console.error("Error getting order by ID:", error);
    throw new Error(error.message);
  }
};

const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const validStatuses = ["Pending", "Processing", "Fulfilled"];
    const statusFlow = {
      Pending: "Processing",
      Processing: "Fulfilled",
      Fulfilled: "Billed",
    };

    const order = await orderDao.getOrderById(orderId);
    if (!order.recordset || order.recordset.length === 0) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    const currentStatus = order.recordset[0].status;

    if (currentStatus === "Billed") {
      throw new Error("Cannot update status of a billed order");
    }

    if (!validStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status. Status must be one of: ${validStatuses.join(", ")}`
      );
    }

    if (newStatus !== statusFlow[currentStatus]) {
      throw new Error(
        `Invalid status transition. Order status can only be updated from ${currentStatus} to ${statusFlow[currentStatus]}`
      );
    }

    await orderDao.updateOrderStatus(orderId, newStatus);

    return {
      orderId,
      previousStatus: currentStatus,
      currentStatus: newStatus,
      message: `Order status successfully updated from ${currentStatus} to ${newStatus}`,
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error(error.message);
  }
};

module.exports = {
  getAllOrders,
  createOrder,
  getOrdersWithFilters,
  getOrderById,
  updateOrderStatus,
}; 