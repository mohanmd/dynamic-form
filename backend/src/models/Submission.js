const mongoose = require('mongoose');

// own collection, submissions can grow a lot
const submissionSchema = new mongoose.Schema(
  {
    form: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
    // { fieldKey: value }
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// submissions of a form, newest first, paginated
submissionSchema.index({ form: 1, _id: -1 });

submissionSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model('Submission', submissionSchema);
