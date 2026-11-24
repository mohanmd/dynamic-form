const express = require('express');
const auth = require('../controllers/authController');
const forms = require('../controllers/formController');
const submissions = require('../controllers/submissionController');
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');
const { validateBody, validateObjectId } = require('../middleware/validate');
const { loginLimiter, submissionLimiter } = require('../middleware/rateLimiters');
const { formBodySchema, formUpdateSchema } = require('../validation/formSchemas');

const router = express.Router();
const adminOnly = [authenticate, authorize('admin')];

router.get('/health', (_req, res) => res.json({ success: true, status: 'ok' }));

// auth
router.post('/auth/login', loginLimiter, validateBody(auth.loginSchema), auth.login);

// forms
router.post('/forms', adminOnly, validateBody(formBodySchema), forms.create);
router.get('/forms', adminOnly, forms.list);
// public only sees published forms, admin sees drafts too
router.get('/forms/:id', validateObjectId('id'), optionalAuth, forms.getOne);
router.put('/forms/:id', adminOnly, validateObjectId('id'), validateBody(formUpdateSchema), forms.update);
router.delete('/forms/:id', adminOnly, validateObjectId('id'), forms.remove);
router.patch('/forms/:id/publish', adminOnly, validateObjectId('id'), forms.publish);

// submissions
// public
router.post('/forms/:formId/submissions', submissionLimiter, validateObjectId('formId'), submissions.create);
// admin
router.get('/forms/:formId/submissions', adminOnly, validateObjectId('formId'), submissions.list);
router.get('/submissions/:id', adminOnly, validateObjectId('id'), submissions.getOne);
router.delete('/submissions/:id', adminOnly, validateObjectId('id'), submissions.remove);

module.exports = router;
