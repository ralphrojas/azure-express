const { Validator } = require("jsonschema");

const validateSchema = (schema, data) => {
  const validator = new Validator();
  const result = validator.validate(data || {}, schema);
  console.log({ result: JSON.stringify(result.errors), data });
  if (!result.valid) {
    return {
      isValid: false,
      errors: result.errors.map((x) => ({
        message: x.schema?.errorMessage || x.message,
        property: x.property,
      })),
    };
  }

  return {
    isValid: true,
    errors: null,
  };
};

module.exports = {
  validateSchema,
};
