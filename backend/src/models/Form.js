const mongoose = require('mongoose');
const { FIELD_TYPE_VALUES, FORM_STATUS } = require('../constants/fieldTypes');

// fields are embedded: always loaded with the form, array order = display order
const fieldSchema = new mongoose.Schema({
  key: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: FIELD_TYPE_VALUES },
  placeholder: { type: String, default: '' },
  defaultValue: { type: mongoose.Schema.Types.Mixed, default: null },
  required: { type: Boolean, default: false },
  options: { type: [String], default: [] },
  validation: {
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
  },
});

const formSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    status: {
      type: String,
      enum: Object.values(FORM_STATUS),
      default: FORM_STATUS.DRAFT,
    },
    fields: { type: [fieldSchema], default: [] },
  },
  { timestamps: true }
);

// admin list: newest first (same sort as listForms)
formSchema.index({ updatedAt: -1, _id: -1 });
// status filter + newest first
formSchema.index({ status: 1, updatedAt: -1 });

formSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model('Form', formSchema);
