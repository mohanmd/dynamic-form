import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getFormById, publishForm, resetBuilder, saveForm, setName } from '../features/builder/builderSlice';
import FieldPalette from '../components/builder/FieldPalette';
import FieldList from '../components/builder/FieldList';
import FieldSettings from '../components/builder/FieldSettings';
import { Alert, Spinner, StatusBadge } from '../components/common/ui';

export default function FormBuilderPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const builder = useSelector((state) => state.builder);
  // { text, id } - a new id restarts the hide timer even when the text is the same
  const [savedMessage, setSavedMessage] = useState(null);

  // load the form or start new. skip reload right after create
  useEffect(() => {
    if (id) {
      if (builder.formId !== id) dispatch(getFormById(id));
    } else {
      dispatch(resetBuilder());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dispatch]);

  // hide the "saved" message after a few seconds
  useEffect(() => {
    if (!savedMessage) return undefined;
    const timer = setTimeout(() => setSavedMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [savedMessage]);

  // after the first save, move to the edit url
  const goToEdit = (response) => {
    if (!id && response.payload?._id) navigate(`/admin/forms/${response.payload._id}/edit`, { replace: true });
  };

  const handleSaveForm = async () => {
    const response = await dispatch(saveForm());
    if (saveForm.fulfilled.match(response)) {
      setSavedMessage({ text: response.payload.status === 'published' ? 'Changes saved.' : 'Draft saved.', id: Date.now() });
      goToEdit(response);
    }
  };

  const handlePublishForm = async () => {
    const response = await dispatch(publishForm());
    if (publishForm.fulfilled.match(response)) {
      setSavedMessage({ text: 'Form published. Use "Open form" to see the live page.', id: Date.now() });
      goToEdit(response);
    }
  };

  if (builder.loadStatus === 'loading') return <Spinner label="Loading form..." />;
  if (builder.loadStatus === 'failed') return <Alert>{builder.error}</Alert>;

  const saving = builder.saveStatus === 'saving';
  const isPublished = builder.status === 'published';
  const errorText = builder.error && [builder.error, ...Object.values(builder.serverErrors || {})].join(' — ');

  return (
    <>
      <div className="page-header builder-header">
        <div className="builder-title">
          <Link to="/admin/forms" className="muted">
            ← All forms
          </Link>
          <input
            className="title-input"
            value={builder.name}
            onChange={(e) => dispatch(setName(e.target.value))}
            placeholder="Form name"
            aria-label="Form name"
          />
          <div className="builder-status">
            <StatusBadge status={builder.status} />
            {builder.dirty ? (
              <span className="save-state unsaved">● Unsaved changes</span>
            ) : (
              builder.lastSavedAt && <span className="save-state saved">✓ Saved</span>
            )}
          </div>
        </div>
        <div className="header-actions">
          {isPublished && (
            <a className="btn" href={`/forms/${builder.formId}`} target="_blank" rel="noreferrer">
              Open form ↗
            </a>
          )}
          <button className="btn" onClick={handleSaveForm} disabled={saving}>
            {saving ? 'Saving...' : isPublished ? 'Save changes' : 'Save draft'}
          </button>
          {!isPublished && (
            <button className="btn btn-primary" onClick={handlePublishForm} disabled={saving || !builder.fields.length}>
              Publish
            </button>
          )}
        </div>
      </div>

      <Alert>{errorText}</Alert>
      <Alert type="success">{savedMessage?.text}</Alert>

      <div className="builder-grid">
        <FieldPalette />
        <FieldList />
        <FieldSettings />
      </div>
    </>
  );
}
