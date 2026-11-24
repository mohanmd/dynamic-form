const Form = require('../models/Form');
const Submission = require('../models/Submission');
const ApiError = require('../utils/ApiError');
const { FORM_STATUS } = require('../constants/fieldTypes');
const { validateSubmission } = require('../validation/submissionValidator');
const { escapeRegex } = require('./formService');

async function createSubmission(formId, payload) {
  const form = await Form.findById(formId, { fields: 1, status: 1 }).lean();
  if (!form || form.status !== FORM_STATUS.PUBLISHED) {
    throw ApiError.notFound('Form not found or not accepting submissions');
  }

  const { isValid, errors, data } = validateSubmission(form, payload);
  if (!isValid) throw ApiError.badRequest('Submission validation failed', errors);

  const submission = await Submission.create({ form: form._id, data });
  return { _id: submission._id, createdAt: submission.createdAt };
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const OPTION_TYPES = ['select', 'radio', 'checkbox'];

// builds the mongo filter from search, date range and one option filter
function buildSubmissionFilter(form, { search, from, to, filterField, filterValue }) {
  const filter = { form: form._id };

  if (ISO_DATE_RE.test(from || '') || ISO_DATE_RE.test(to || '')) {
    filter.createdAt = {};
    if (ISO_DATE_RE.test(from || '')) filter.createdAt.$gte = new Date(`${from}T00:00:00.000Z`);
    if (ISO_DATE_RE.test(to || '')) filter.createdAt.$lte = new Date(`${to}T23:59:59.999Z`);
  }

  // filter like department = Engineering, only on option fields and known options
  const optionField = form.fields.find((f) => f.key === filterField && OPTION_TYPES.includes(f.type));
  if (optionField && optionField.options.includes(filterValue)) {
    filter[`data.${optionField.key}`] = filterValue; // also matches inside checkbox arrays
  }

  // search text in every field of the form
  if (search) {
    const regex = { $regex: escapeRegex(search), $options: 'i' };
    const or = form.fields.filter((f) => f.type !== 'number').map((f) => ({ [`data.${f.key}`]: regex }));
    const asNumber = Number(search);
    if (Number.isFinite(asNumber)) {
      form.fields.filter((f) => f.type === 'number').forEach((f) => or.push({ [`data.${f.key}`]: asNumber }));
    }
    if (or.length) filter.$or = or;
  }
  return filter;
}

async function listSubmissions(formId, { page = 1, limit = 10, sortBy, order, ...filters }) {
  const form = await Form.findById(formId, { name: 1, fields: 1 }).lean();
  if (!form) throw ApiError.notFound('Form not found');

  const filter = buildSubmissionFilter(form, filters);

  // sort by submitted date (_id) or by any field of the form
  const direction = order === 'asc' ? 1 : -1;
  const sortField = form.fields.some((f) => f.key === sortBy) ? `data.${sortBy}` : '_id';
  const sort = sortField === '_id' ? { _id: direction } : { [sortField]: direction, _id: direction };

  const [items, total] = await Promise.all([
    Submission.find(filter, { data: 1, createdAt: 1 })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Submission.countDocuments(filter),
  ]);

  return {
    form: { _id: form._id, name: form.name, fields: form.fields },
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

async function getSubmission(id) {
  const submission = await Submission.findById(id).populate('form', 'name fields').lean();
  if (!submission) throw ApiError.notFound('Submission not found');
  return submission;
}

async function deleteSubmission(id) {
  const submission = await Submission.findByIdAndDelete(id);
  if (!submission) throw ApiError.notFound('Submission not found');
  return { _id: submission._id };
}

module.exports = { createSubmission, listSubmissions, getSubmission, deleteSubmission };
