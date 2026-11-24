// all inputs take { field, value, onChange, onBlur, error, disabled }

const inputId = (field) => `field-${field.key}`;

export function TextLikeInput({ field, value, onChange, onBlur, error, disabled }) {
  const htmlType = { text: 'text', email: 'email', number: 'number', phone: 'tel', date: 'date' }[field.type] || 'text';
  const rules = field.validation || {};
  return (
    <input
      id={inputId(field)}
      className={`input ${error ? 'input-error' : ''}`}
      type={htmlType}
      value={value ?? ''}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      min={field.type === 'number' ? rules.min : undefined}
      max={field.type === 'number' ? rules.max : undefined}
      maxLength={rules.maxLength}
      aria-invalid={!!error}
      aria-describedby={error ? `${inputId(field)}-error` : undefined}
    />
  );
}

export function TextAreaInput({ field, value, onChange, onBlur, error, disabled }) {
  return (
    <textarea
      id={inputId(field)}
      className={`input ${error ? 'input-error' : ''}`}
      rows={4}
      value={value ?? ''}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      maxLength={field.validation?.maxLength}
      aria-invalid={!!error}
    />
  );
}

export function SelectInput({ field, value, onChange, onBlur, error, disabled }) {
  return (
    <select
      id={inputId(field)}
      className={`input ${error ? 'input-error' : ''}`}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      aria-invalid={!!error}
    >
      <option value="">{field.placeholder || 'Select an option'}</option>
      {field.options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function RadioGroup({ field, value, onChange, onBlur, disabled }) {
  return (
    <div className="choice-group" role="radiogroup" id={inputId(field)}>
      {field.options.map((opt) => (
        <label key={opt} className="choice">
          <input
            type="radio"
            name={field.key}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            onBlur={onBlur}
            disabled={disabled}
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

export function CheckboxGroup({ field, value, onChange, onBlur, disabled }) {
  const selected = Array.isArray(value) ? value : [];
  const toggle = (opt) => onChange(selected.includes(opt) ? selected.filter((v) => v !== opt) : [...selected, opt]);
  return (
    <div className="choice-group" id={inputId(field)}>
      {field.options.map((opt) => (
        <label key={opt} className="choice">
          <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} onBlur={onBlur} disabled={disabled} />
          {opt}
        </label>
      ))}
    </div>
  );
}
