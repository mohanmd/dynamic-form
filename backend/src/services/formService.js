const Form = require('../models/Form');
const Submission = require('../models/Submission');
const ApiError = require('../utils/ApiError');
const { FORM_STATUS } = require('../constants/fieldTypes');
const { validateFieldsSemantics } = require('../validation/formSchemas');

function assertFieldsValid(fields) {
  const errors = validateFieldsSemantics(fields);
  if (Object.keys(errors).length) throw ApiError.badRequest('Validation failed', errors);
}

async function createForm(body) {
  assertFieldsValid(body.fields);
  const form = await Form.create({ ...body, status: FORM_STATUS.DRAFT });
  return form.toJSON();
}

// columns the list can be sorted by (anything else falls back to updatedAt)
const FORM_SORT_FIELDS = ['name', 'status', 'createdAt', 'updatedAt'];

// escape regex characters so a search like "a.*" is treated as plain text
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function listForms({ page = 1, limit = 10, search, status, sortBy, order }) {
  const filter = {};
  if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' };
  if (Object.values(FORM_STATUS).includes(status)) filter.status = status;

  const sortField = FORM_SORT_FIELDS.includes(sortBy) ? sortBy : 'updatedAt';
  const direction = order === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    Form.find(filter, { name: 1, status: 1, createdAt: 1, updatedAt: 1, fieldCount: { $size: '$fields' } })
      .sort({ [sortField]: direction, _id: direction })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Form.countDocuments(filter),
  ]);

  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
}

// admin can read drafts, public gets 404 for them
async function getForm(id, user) {
  const form = await Form.findById(id).lean();
  const isAdmin = user && user.role === 'admin';
  if (!form || (!isAdmin && form.status !== FORM_STATUS.PUBLISHED)) {
    throw ApiError.notFound('Form not found');
  }
  if (!isAdmin) {
    const { _id, name, fields } = form;
    return { _id, name, fields };
  }
  return form;
}

async function updateForm(id, body) {
  const form = await Form.findById(id);
  if (!form) throw ApiError.notFound('Form not found');

  if (body.name !== undefined) form.name = body.name;
  if (body.fields !== undefined) {
    assertFieldsValid(body.fields);
    form.fields = body.fields;
  }

  await form.save();
  return form.toJSON();
}

async function publishForm(id) {
  const form = await Form.findById(id);
  if (!form) throw ApiError.notFound('Form not found');
  if (form.fields.length === 0) {
    throw ApiError.badRequest('A form must have at least one field before it can be published');
  }
  form.status = FORM_STATUS.PUBLISHED;
  await form.save();
  return form.toJSON();
}

async function deleteForm(id) {
  const form = await Form.findByIdAndDelete(id);
  if (!form) throw ApiError.notFound('Form not found');
  const { deletedCount } = await Submission.deleteMany({ form: form._id });
  return { id: form._id, deletedSubmissions: deletedCount };
}

module.exports = { createForm, listForms, getForm, updateForm, publishForm, deleteForm, escapeRegex };
