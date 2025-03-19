const express = require("express");
const createHandler = require("azure-function-express").createHandler;
const { validateSchema } = require("../common/utils/validation");
const { createInvoiceFromOrder } = require("../common/services/invoiceService");
const { connectDB } = require("../common/config/database");

const app = express();

app.post("/api/invoices", async (req, res) => {
  try {
    const jsonSchema = require("./create-invoice.schema.json");
    const validationResult = validateSchema(jsonSchema, req.body);
    console.log({ validationResult, body: req.body });
    if (!validationResult.isValid) {
      return res.status(400).json({
        message: "Invalid request body",
        validationResult: validationResult,
      });
    }

    await connectDB();
    const result = await createInvoiceFromOrder(req.body.orderId);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating invoice:", error);
    res
      .status(error.message.includes("already exist") ? 409 : 500)
      .json({ message: error.message });
  }
});

module.exports = createHandler(app);
