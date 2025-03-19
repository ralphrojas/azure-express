const express = require("express");
const createHandler = require("azure-function-express").createHandler;
const { validateSchema } = require("../common/utils/validation");
const {
  getOrdersWithFilters,
  getOrderById,
  createOrder,
  updateOrderStatus,
} = require("../common/services/orderService");
const { connectDB } = require("../common/config/database");

const app = express();

app.get("/api/orders", async (req, res) => {
  try {
    const querySchema = require("./get-orders.schema.json");
    const queryValidationResult = validateSchema(querySchema, req.query);
    if (!queryValidationResult.isValid) {
      return res.status(400).json({
        message: "Invalid query parameters",
        validationResult: queryValidationResult,
      });
    }
    await connectDB();
    orders = await getOrdersWithFilters(req.query);
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving order data.", error: error.message });
  }
});

app.get("/api/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const jsonSchema = require("./get-order.schema.json");
    const validationResult = validateSchema(jsonSchema, { orderId });

    if (!validationResult.isValid) {
      return res.status(400).json({
        message: "Invalid order ID",
        validationResult: validationResult,
      });
    }

    await connectDB();
    order = await getOrderById(orderId);
    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving order data.", error: error.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const jsonSchema = require("./create-order.schema.json");
    const validationResult = validateSchema(jsonSchema, req.body);
    if (!validationResult.isValid) {
      res.status(400).json({
        message: "Invalid request body",
        validationResult: validationResult,
      });
      return;
    }
    await connectDB();
    newOrders = await createOrder(req.body);
    res.status(200).json(newOrders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving order data.", error: error.message });
  }
});

app.patch("/api/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const jsonSchema = require("./update-order-status.schema.json");
    const validationResult = validateSchema(jsonSchema, req.body);

    if (!validationResult.isValid) {
      return res.status(400).json({
        message: "Invalid request body",
        validationResult: validationResult,
      });
    }

    await connectDB();
    const result = await updateOrderStatus(orderId, req.body.orderStatus);
    res.status(200).json(result);
  } catch (error) {
    const statusCode = error.message.includes("not found")
      ? 404
      : error.message.includes("Invalid status")
      ? 400
      : 500;

    res.status(statusCode).json({
      message: "Error updating order status",
      error: error.message,
    });
  }
});

module.exports = createHandler(app);
