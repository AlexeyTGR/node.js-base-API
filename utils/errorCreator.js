class ResponseError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  };
};

// module.exports = CreateError;
module.exports = {
  notFound: (message) => new ResponseError(404, message),
  badRequest: (message) => new ResponseError(400, message),
  unauthorized: (message) => new ResponseError(401, message),
  forbidden: (message) => new ResponseError(403, message),
};

