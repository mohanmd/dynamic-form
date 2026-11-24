import { useDispatch } from 'react-redux';
import { FIELD_TYPES, FIELD_TYPE_KEYS } from '../../constant/fieldTypes';
import { addField } from '../../features/builder/builderSlice';

export default function FieldPalette() {
  const dispatch = useDispatch();
  return (
    <div className="panel">
      <h3 className="panel-title">Add field</h3>
      <div className="palette">
        {FIELD_TYPE_KEYS.map((type) => (
          <button key={type} type="button" className="palette-item" onClick={() => dispatch(addField(type))}>
            {FIELD_TYPES[type].label}
          </button>
        ))}
      </div>
    </div>
  );
}
