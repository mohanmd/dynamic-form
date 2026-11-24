import { useState } from 'react';

export default function OptionsEditor({ options, onChange }) {
  const [draft, setDraft] = useState('');

  const rename = (i, value) => onChange(options.map((o, idx) => (idx === i ? value : o)));
  const remove = (i) => onChange(options.filter((_, idx) => idx !== i));
  const add = () => {
    const v = draft.trim();
    if (!v || options.includes(v)) return;
    onChange([...options, v]);
    setDraft('');
  };

  return (
    <div className="options-editor">
      {options.map((opt, i) => (
        <div key={i} className="option-row">
          <input className="input input-sm" value={opt} onChange={(e) => rename(i, e.target.value)} />
          <button type="button" className="icon-btn danger" onClick={() => remove(i)} title="Remove option">
            ✕
          </button>
        </div>
      ))}
      <div className="option-row">
        <input className="input input-sm" placeholder="New option" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <button type="button" className="btn btn-sm" onClick={add}>
          Add
        </button>
      </div>
    </div>
  );
}
