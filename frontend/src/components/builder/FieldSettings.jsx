import { useDispatch, useSelector } from 'react-redux';
import { FIELD_TYPES, FIELD_TYPE_KEYS } from '../../constant/fieldTypes';
import { selectSelectedField, updateField } from '../../features/builder/builderSlice';
import OptionsEditor from './OptionsEditor';
import FieldRenderer from '../fields/FieldRenderer';

export default function FieldSettings() {
  const dispatch = useDispatch();
  const field = useSelector(selectSelectedField);

  if (!field) {
    return (
      <div className="panel">
        <h3 className="panel-title">Field settings</h3>
      </div>
    );
  }

  const meta = FIELD_TYPES[field.type];
  const change = (changes) => dispatch(updateField({ id: field.id, changes }));
  const changeRule = (rule, value) => change({ validation: { ...field.validation, [rule]: value === '' ? undefined : value } });

  return (
    <div className="panel">
      <h3 className="panel-title">Field settings</h3>

      <div className="form-group">
        <label className="label">Type</label>
        <select className="input" value={field.type} onChange={(e) => change({ type: e.target.value })}>
          {FIELD_TYPE_KEYS.map((t) => (
            <option key={t} value={t}>
              {FIELD_TYPES[t].label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="label">Label</label>
        <input className="input" value={field.label} onChange={(e) => change({ label: e.target.value })} />
      </div>

      <div className="form-group">
        <label className="label">Field key</label>
        <input className="input mono" value={field.key} onChange={(e) => change({ key: e.target.value.replace(/\s/g, '') })} />
      </div>

      <div className="form-group">
        <label className="label">Placeholder</label>
        <input className="input" value={field.placeholder} onChange={(e) => change({ placeholder: e.target.value })} />
      </div>

      <label className="choice toggle">
        <input type="checkbox" checked={field.required} onChange={(e) => change({ required: e.target.checked })} />
        Required
      </label>

      {meta.hasOptions && (
        <div className="form-group">
          <label className="label">Options</label>
          <OptionsEditor options={field.options} onChange={(options) => change({ options })} />
        </div>
      )}

      {(meta.length || meta.range) && (
        <div className="form-group">
          <label className="label">Validation</label>
          <div className="grid-2">
            {meta.length && (
              <>
                <input
                  className="input input-sm"
                  type="number"
                  min="0"
                  placeholder="Min length"
                  value={field.validation.minLength ?? ''}
                  onChange={(e) => changeRule('minLength', e.target.value)}
                />
                <input
                  className="input input-sm"
                  type="number"
                  min="1"
                  placeholder="Max length"
                  value={field.validation.maxLength ?? ''}
                  onChange={(e) => changeRule('maxLength', e.target.value)}
                />
              </>
            )}
            {meta.range && (
              <>
                <input
                  className="input input-sm"
                  type="number"
                  placeholder={field.type === 'checkbox' ? 'Min selections' : 'Min value'}
                  value={field.validation.min ?? ''}
                  onChange={(e) => changeRule('min', e.target.value)}
                />
                <input
                  className="input input-sm"
                  type="number"
                  placeholder={field.type === 'checkbox' ? 'Max selections' : 'Max value'}
                  value={field.validation.max ?? ''}
                  onChange={(e) => changeRule('max', e.target.value)}
                />
              </>
            )}
          </div>
        </div>
      )}

      <div className="form-group">
        <div className="label">Default value</div>
        {/* use the real input for the default value */}
        <FieldRenderer
          field={{ ...field, key: `default_${field.key}`, label: '', required: false }}
          value={field.defaultValue}
          onChange={(v) => change({ defaultValue: v })}
        />
      </div>
    </div>
  );
}
