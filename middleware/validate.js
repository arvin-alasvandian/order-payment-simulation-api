// middleware/validate.js
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(
    { body: req.body, params: req.params, query: req.query, headers: req.headers },
    { abortEarly: false, stripUnknown: true }
  );

  if (error) {
    return res.status(400).json({
      ok: false,
      error: 'validation_error',
      details: error.details.map(d => ({
        msg: d.message,
        path: d.path.join('.')
      }))
    });
  }

  req.body = value.body ?? req.body;
  req.params = value.params ?? req.params;
  req.query = value.query ?? req.query;
  req.headers = value.headers ?? req.headers;

  next();
};

module.exports = validate;
