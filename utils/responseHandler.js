module.exports.responseHandler = (res, message, payload, token) => {
  return res.status(200).json({
    message: message,
    data: payload,
  });
};

module.exports.errorHandler = (res, code, message) => {
  return res.status(code).json({
    message: `Error: ${message}`
  });
};