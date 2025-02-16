const response = {
  success: (res, data = null, message = "Success", statusCode = 200) => {
    res.status(statusCode).json({
      status: "success",
      message,
      data,
    });
  },

  error: (res, error = "Something went wrong", statusCode = 500) => {
    res.status(statusCode).json({
      status: "error",
      message: error,
    });
  },

  validation: (
    res,
    errors = [],
    message = "Validation Error",
    statusCode = 422
  ) => {
    res.status(statusCode).json({
      status: "fail",
      message,
      errors,
    });
  },
};

module.exports = response;
