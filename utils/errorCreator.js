class CreateError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.message = message;
  };

  static notFound(message) {
    return new CreateError(404, message);
  };

  static badRequest(message) {
    return new CreateError(400, message);
  };

  static unauthorized(message) {
    return new CreateError(401, message);
  };

  static forbidden(message) {
    return new CreateError(403, message);
  };
};

module.exports = CreateError;

