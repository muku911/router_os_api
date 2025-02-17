const response = {
  /**
   * Return a successful response with a JSON object containing
   * a status key set to "success", a message key set to the
   * given message, and a data key containing the given data.
   * @param {Response} res - the response object from Express
   * @param {Object} [data=null] - the data to be sent in the response
   * @param {String} [message="Success"] - the message to be sent in the response
   * @param {Number} [statusCode=200] - the HTTP status code to be sent
   */
  success: (res, data = null, message = "Success", statusCode = 200) => {
    res.status(statusCode).json({
      status: "success",
      message,
      data,
    });
  },

  /**
   * Return an error response with a JSON object containing
   * a status key set to "error" and a message key set to the
   * given error message.
   * @param {Response} res - the response object from Express
   * @param {String} [error="Something went wrong"] - the error message to be sent in the response
   * @param {Number} [statusCode=500] - the HTTP status code to be sent
   */

  error: (res, error = "Something went wrong", statusCode = 500) => {
    res.status(statusCode).json({
      status: "error",
      message: error,
    });
  },

  /**
   * Return a validation error response with a JSON object containing
   * a status key set to "fail", a message key set to the given message,
   * and a errors key containing an array of validation errors.
   * @param {Response} res - the response object from Express
   * @param {Array<Object>} [errors=[]] - the array of validation errors
   * @param {String} [message="Validation Error"] - the error message to be sent in the response
   * @param {Number} [statusCode=422] - the HTTP status code to be sent
   */
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
