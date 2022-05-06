module.exports.responseHandler = (res, code, message, payload) => {
  return res.status(code).json({
    message,
    data: payload,
  });
};