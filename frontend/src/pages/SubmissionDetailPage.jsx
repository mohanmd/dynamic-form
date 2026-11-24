import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { deleteSubmission, getSubmissionById } from '../features/submissions/submissionsSlice';
import { Alert, Spinner, formatValue } from '../components/common/ui';

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, currentStatus, currentError, deleteError } = useSelector((state) => state.submissions);

  useEffect(() => {
    dispatch(getSubmissionById(id));
  }, [dispatch, id]);

  if (currentStatus === 'loading' || (currentStatus === 'idle' && !current)) return <Spinner />;
  if (currentStatus === 'failed') return <Alert>{currentError}</Alert>;
  if (!current) return null;

  const form = current.form;
  const fields = form?.fields || [];

  const handleDeleteSubmission = async () => {
    if (!window.confirm('Delete this submission? This cannot be undone.')) return;
    const response = await dispatch(deleteSubmission(id));
    if (deleteSubmission.fulfilled.match(response)) navigate(form ? `/admin/forms/${form._id}/submissions` : '/admin/forms');
  };

  return (
    <>
      <div className="page-header">
        <div>
          {form && (
            <Link to={`/admin/forms/${form._id}/submissions`} className="muted">
              ← Submissions of {form.name}
            </Link>
          )}
          <h1>Submission</h1>
          <p className="muted">{new Date(current.createdAt).toLocaleString()}</p>
        </div>
        <button className="btn btn-danger" onClick={handleDeleteSubmission}>
          Delete
        </button>
      </div>
      <Alert>{deleteError}</Alert>

      <div className="card">
        <dl className="detail-list">
          {fields.map((f) => (
            <div key={f.key} className="detail-row">
              <dt>{f.label}</dt>
              <dd>{formatValue(current.data?.[f.key])}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
