import { CheckboxGroup, RadioGroup, SelectInput, TextAreaInput, TextLikeInput } from './inputs';

// field type -> component
const FIELD_COMPONENTS = {
  text: TextLikeInput,
  email: TextLikeInput,
  number: TextLikeInput,
  phone: TextLikeInput,
  date: TextLikeInput,
  textarea: TextAreaInput,
  select: SelectInput,
  radio: RadioGroup,
  checkbox: CheckboxGroup,
};

export default function FieldRenderer({ field, value, onChange, onBlur, error, disabled }) {
  const Component = FIELD_COMPONENTS[field.type];
  return (
    <div className="form-group">
      <label className="label" htmlFor={`field-${field.key}`}>
        {field.label}
        {field.required && <span className="required">*</span>}
      </label>
      {Component ? (
        <Component field={field} value={value} onChange={onChange} onBlur={onBlur} error={error} disabled={disabled} />
      ) : (
        <div className="error-text">Unsupported field type: {field.type}</div>
      )}
      {error && (
        <div className="error-text" id={`field-${field.key}-error`}>
          {error}
        </div>
      )}
    </div>
  );
}
