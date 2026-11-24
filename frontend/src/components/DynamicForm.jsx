import { useEffect, useMemo, useState } from 'react';
import FieldRenderer from './fields/FieldRenderer';
import { initialValues, validateAll, validateField } from '../utils/validation';

// renders any form definition. values are local state, redux not needed here
export default function DynamicForm({ fields, onSubmit, submitting = false, serverErrors }) {
  const defaults = useMemo(() => initialValues(fields), [fields]);
  const [values, setValues] = useState(defaults);
  const [errors, setErrors] = useState({});

  // show server errors too
  useEffect(() => {
    if (serverErrors) setErrors((prev) => ({ ...prev, ...serverErrors }));
  }, [serverErrors]);

  const handleChange = (field, value) => {
    setValues((v) => ({ ...v, [field.key]: value }));
    if (errors[field.key]) setErrors((e) => ({ ...e, [field.key]: validateField(field, value) }));
  };

  const handleBlur = (field) => {
    setErrors((e) => ({ ...e, [field.key]: validateField(field, values[field.key]) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const clientErrors = validateAll(fields, values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="dynamic-form">
      {fields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={values[field.key]}
          error={errors[field.key]}
          onChange={(v) => handleChange(field, v)}
          onBlur={() => handleBlur(field)}
          disabled={submitting}
        />
      ))}
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
