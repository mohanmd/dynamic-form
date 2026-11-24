import { useDispatch, useSelector } from 'react-redux';
import { FIELD_TYPES } from '../../constant/fieldTypes';
import { moveField, removeField, selectField } from '../../features/builder/builderSlice';

export default function FieldList() {
  const dispatch = useDispatch();
  const { fields, selectedId } = useSelector((state) => state.builder);

  if (!fields.length) {
    return (
      <div className="panel field-list-empty">
        <p>No fields yet.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h3 className="panel-title">Fields ({fields.length})</h3>
      <ul className="field-list">
        {fields.map((f, i) => (
          <li
            key={f.id}
            className={`field-card ${f.id === selectedId ? 'selected' : ''}`}
            onClick={() => dispatch(selectField(f.id))}
          >
            <div className="field-card-body">
              <div className="field-card-title">
                {f.label || <em className="muted">Untitled</em>}
                {f.required && <span className="required">*</span>}
              </div>
              <div className="field-card-meta">
                <span className="chip">{FIELD_TYPES[f.type].label}</span>
                <code>{f.key}</code>
              </div>
            </div>
            <div className="field-card-actions" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="icon-btn" title="Move up" disabled={i === 0} onClick={() => dispatch(moveField({ from: i, to: i - 1 }))}>
                ↑
              </button>
              <button
                type="button"
                className="icon-btn"
                title="Move down"
                disabled={i === fields.length - 1}
                onClick={() => dispatch(moveField({ from: i, to: i + 1 }))}
              >
                ↓
              </button>
              <button type="button" className="icon-btn danger" title="Delete" onClick={() => dispatch(removeField(f.id))}>
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
