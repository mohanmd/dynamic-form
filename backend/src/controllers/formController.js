const asyncHandler = require('../utils/asyncHandler');
const formService = require('../services/formService');

function parsePaging(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  return { page, limit };
}

const create = asyncHandler(async (req, res) => {
  const form = await formService.createForm(req.body);
  res.status(201).json({ success: true, data: form });
});

// search, filter and sort values from the query string
function parseListQuery(query) {
  const text = (value) => (typeof value === 'string' ? value.trim().slice(0, 100) : undefined);
  return {
    search: text(query.search) || undefined,
    status: text(query.status),
    sortBy: text(query.sortBy),
    order: query.order === 'asc' ? 'asc' : 'desc',
  };
}

const list = asyncHandler(async (req, res) => {
  const result = await formService.listForms({ ...parsePaging(req.query), ...parseListQuery(req.query) });
  res.json({ success: true, data: result.items, meta: result.meta });
});

const getOne = asyncHandler(async (req, res) => {
  const form = await formService.getForm(req.params.id, req.user);
  res.json({ success: true, data: form });
});

const update = asyncHandler(async (req, res) => {
  const form = await formService.updateForm(req.params.id, req.body);
  res.json({ success: true, data: form });
});

const publish = asyncHandler(async (req, res) => {
  const form = await formService.publishForm(req.params.id);
  res.json({ success: true, data: form });
});

const remove = asyncHandler(async (req, res) => {
  const result = await formService.deleteForm(req.params.id);
  res.json({ success: true, data: result });
});

module.exports = { create, list, getOne, update, publish, remove, parsePaging, parseListQuery };
