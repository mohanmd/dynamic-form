import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPublicForm, saveSubmission } from '../features/publicForm/publicFormSlice';
import DynamicForm from '../components/DynamicForm';
import { Alert, Spinner } from '../components/common/ui';

export default function PublicFormPage() {
  const { formId } = useParams();
  const dispatch = useDispatch();
  const { form, status, error, submitStatus, submitError, serverErrors } = useSelector((state) => state.publicForm);

  useEffect(() => {
    dispatch(getPublicForm(formId));
  }, [dispatch, formId]);

  const handleSubmitForm = (values) => dispatch(saveSubmission({ formId, data: values }));

  return (
    <div className="public-page">
      <div className="card public-card">
        {status === 'loading' && <Spinner label="Loading form..." />}
        {status === 'failed' && (
          <>
            <h2>Form unavailable</h2>
            <Alert>{error}</Alert>
          </>
        )}
        {status === 'succeeded' && form && (
          <>
            <h1>{form.name}</h1>
            {submitStatus === 'succeeded' ? (
              <div className="success-box">
                <div className="success-icon">✓</div>
                <h2>Thank you!</h2>
                <p>Your response has been recorded.</p>
              </div>
            ) : (
              <>
                <Alert>{submitError}</Alert>
                <DynamicForm
                  fields={form.fields}
                  onSubmit={handleSubmitForm}
                  submitting={submitStatus === 'submitting'}
                  serverErrors={serverErrors}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
