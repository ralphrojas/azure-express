const { connectDB } = require("../common/config/database");
const {
  getCustomer,
  createCustomer,
  updateCustomer,
} = require("../common/services/customerService");

const sendResponse = (context, status, body) => {
  context.res = {
    status,
    headers: {
      "Content-Type": "application/json",
    },
    body,
  };
};

module.exports = async function (context, req) {
  try {
    await connectDB();
    console.log({ context });
    let customers, newCustomer, updatedCustomer;
    const customerId = context.bindingData?.customerId;

    switch (req.method) {
      case "GET":
        customers = await getCustomer();
        sendResponse(context, 200, customers);
        break;

      case "POST":
        if (!req.body) {
          sendResponse(
            context,
            400,
            "Request body is required for creating a customer"
          );
          return;
        }
        newCustomer = await createCustomer(req.body);
        sendResponse(context, 201, newCustomer);
        break;

      case "PUT":
        if (!customerId) {
          sendResponse(
            context,
            400,
            "Customer ID is required in URL parameters for updating a customer"
          );
          return;
        }
        if (!req.body) {
          sendResponse(
            context,
            400,
            "Request body is required for updating a customer"
          );
          return;
        }
        updatedCustomer = await updateCustomer(customerId, req.body);
        sendResponse(context, 200, updatedCustomer);
        break;

      default:
        sendResponse(context, 405, "Method not allowed");
    }
  } catch (error) {
    sendResponse(
      context,
      500,
      error.message || "Error processing customer request"
    );
  }
};
