const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const submissionService = require('../services/submissionService');
const { parsePaging, parseListQuery } = require('./formController');

const create = asyncHandler(async (req, res) => {
  // body: { data: { fieldKey: value } }
  const payload = req.body && req.body.data;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw ApiError.badRequest('Request body must be of the form { "data": { ... } }');
  }
  const result = await submissionService.createSubmission(req.params.formId, payload);
  res.status(201).json({ success: true, message: 'Submission received', data: result });
});

const list = asyncHandler(async (req, res) => {
  const text = (value) => (typeof value === 'string' ? value.trim().slice(0, 100) : undefined);
  const result = await submissionService.listSubmissions(req.params.formId, {
    ...parsePaging(req.query),
    ...parseListQuery(req.query),
    from: text(req.query.from),
    to: text(req.query.to),
    filterField: text(req.query.filterField),
    filterValue: text(req.query.filterValue),
  });
  res.json({ success: true, data: result.items, form: result.form, meta: result.meta });
});

const getOne = asyncHandler(async (req, res) => {
  const submission = await submissionService.getSubmission(req.params.id);
  res.json({ success: true, data: submission });
});

const remove = asyncHandler(async (req, res) => {
  const result = await submissionService.deleteSubmission(req.params.id);
  res.json({ success: true, data: result });
});

module.exports = { create, list, getOne, remove };
