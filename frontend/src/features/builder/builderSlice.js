import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit';
import api, { getApiError } from '../../services/ApiService';
import { ENDPOINTS } from '../../constant/ApiEndpoints';
import { FIELD_TYPES } from '../../constant/fieldTypes';

// the form being edited. palette, list and settings all use it, so it's in redux

// new field with a unique key like text, text2, text3
const makeField = (type, existingKeys) => {
  let n = 1;
  let key = type;
  while (existingKeys.includes(key)) key = `${type}${++n}`;
  return {
    id: nanoid(),
    key,
    label: FIELD_TYPES[type].label,
    type,
    placeholder: '',
    defaultValue: type === 'checkbox' ? [] : '',
    required: false,
    options: FIELD_TYPES[type].hasOptions ? ['Option 1', 'Option 2'] : [],
    validation: {},
  };
};

// local id is the react key, because the field key can be edited
const fromServerField = (f) => ({
  id: nanoid(),
  key: f.key,
  label: f.label,
  type: f.type,
  placeholder: f.placeholder || '',
  defaultValue: f.defaultValue ?? (f.type === 'checkbox' ? [] : ''),
  required: !!f.required,
  options: f.options || [],
  validation: f.validation || {},
});

// builder state -> api body (drops the local id)
export const toPayload = ({ name, fields }) => ({
  name: name.trim(),
  fields: fields.map((f) => {
    const validation = {};
    for (const k of ['minLength', 'maxLength', 'min', 'max']) {
      if (f.validation?.[k] !== undefined && f.validation[k] !== '' && f.validation[k] !== null) {
        validation[k] = Number(f.validation[k]);
      }
    }
    const isEmptyDefault = f.defaultValue === '' || (Array.isArray(f.defaultValue) && f.defaultValue.length === 0);
    return {
      key: f.key.trim(),
      label: f.label.trim(),
      type: f.type,
      placeholder: f.placeholder || '',
      required: f.required,
      defaultValue: isEmptyDefault ? null : f.type === 'number' ? Number(f.defaultValue) : f.defaultValue,
      validation,
      ...(FIELD_TYPES[f.type].hasOptions ? { options: f.options.map((o) => o.trim()).filter(Boolean) } : {}),
    };
  }),
});

export const getFormById = createAsyncThunk('builder/getById', async (formId, { rejectWithValue }) => {
  try {
    const response = await api.get(`${ENDPOINTS.getFormById}/${formId}`);
    const result = response?.data;
    if (response.status === 200) return result?.data;
    return rejectWithValue({ message: result?.message });
  } catch (error) {
    console.error('form get error:', error);
    return rejectWithValue(getApiError(error));
  }
});

// create when new, update when it already has an id
export const saveForm = createAsyncThunk('builder/save', async (_, { getState, rejectWithValue }) => {
  const { builder } = getState();
  const formData = toPayload(builder);
  try {
    const response = builder.formId
      ? await api.put(`${ENDPOINTS.updateForm}/${builder.formId}`, formData)
      : await api.post(ENDPOINTS.saveForm, formData);
    const result = response?.data;
    if (response.status === 200 || response.status === 201) return result?.data;
    return rejectWithValue({ message: result?.message });
  } catch (error) {
    console.error('save || edit form error:', error);
    return rejectWithValue(getApiError(error));
  }
});

// save first, then publish
export const publishForm = createAsyncThunk('builder/publish', async (_, { dispatch, getState, rejectWithValue }) => {
  const saved = await dispatch(saveForm());
  if (saveForm.rejected.match(saved)) return rejectWithValue(saved.payload);
  try {
    const response = await api.patch(`${ENDPOINTS.publishForm}/${getState().builder.formId}/publish`);
    const result = response?.data;
    if (response.status === 200) return result?.data;
    return rejectWithValue({ message: result?.message });
  } catch (error) {
    console.error('form publish error:', error);
    return rejectWithValue(getApiError(error));
  }
});

const initialState = {
  formId: null,
  name: 'Untitled form',
  status: 'draft',
  fields: [],
  selectedId: null,
  loadStatus: 'idle',
  saveStatus: 'idle',
  dirty: false, // true when there are changes not saved yet
  lastSavedAt: null,
  error: null,
  serverErrors: null,
};

const builderSlice = createSlice({
  name: 'builder',
  initialState,
  reducers: {
    resetBuilder: () => initialState,
    setName(state, { payload }) {
      state.name = payload;
      state.dirty = true;
    },
    addField(state, { payload: type }) {
      const field = makeField(type, state.fields.map((f) => f.key));
      state.fields.push(field);
      state.selectedId = field.id;
      state.dirty = true;
    },
    updateField(state, { payload: { id, changes } }) {
      const field = state.fields.find((f) => f.id === id);
      if (!field) return;
      Object.assign(field, changes);
      // new type -> reset type specific settings
      if ('type' in changes) {
        if (FIELD_TYPES[changes.type].hasOptions && field.options.length === 0) field.options = ['Option 1', 'Option 2'];
        field.defaultValue = changes.type === 'checkbox' ? [] : '';
        field.validation = {};
      }
      state.dirty = true;
    },
    removeField(state, { payload: id }) {
      const idx = state.fields.findIndex((f) => f.id === id);
      if (idx === -1) return;
      state.fields.splice(idx, 1);
      if (state.selectedId === id) state.selectedId = state.fields[Math.min(idx, state.fields.length - 1)]?.id ?? null;
      state.dirty = true;
    },
    moveField(state, { payload: { from, to } }) {
      if (to < 0 || to >= state.fields.length || from === to) return;
      const [moved] = state.fields.splice(from, 1);
      state.fields.splice(to, 0, moved);
      state.dirty = true;
    },
    selectField(state, { payload: id }) {
      state.selectedId = id;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFormById.pending, (state) => {
        Object.assign(state, initialState, { loadStatus: 'loading' });
      })
      .addCase(getFormById.fulfilled, (state, { payload }) => {
        state.formId = payload._id;
        state.name = payload.name;
        state.status = payload.status;
        state.fields = payload.fields.map(fromServerField);
        state.selectedId = state.fields[0]?.id ?? null;
        state.loadStatus = 'succeeded';
        state.dirty = false;
      })
      .addCase(getFormById.rejected, (state, { payload }) => {
        state.loadStatus = 'failed';
        state.error = payload?.message;
      })
      .addCase(saveForm.pending, (state) => {
        state.saveStatus = 'saving';
        state.error = null;
        state.serverErrors = null;
      })
      .addCase(saveForm.fulfilled, (state, { payload }) => {
        state.formId = payload._id;
        state.status = payload.status;
        state.saveStatus = 'saved';
        state.dirty = false;
        state.lastSavedAt = Date.now();
      })
      .addCase(saveForm.rejected, (state, { payload }) => {
        state.saveStatus = 'error';
        state.error = payload?.message;
        state.serverErrors = payload?.errors;
      })
      .addCase(publishForm.fulfilled, (state, { payload }) => {
        state.status = payload.status;
      })
      .addCase(publishForm.rejected, (state, { payload }) => {
        state.saveStatus = 'error';
        state.error = payload?.message;
        state.serverErrors = payload?.errors || state.serverErrors;
      });
  },
});

export const { resetBuilder, setName, addField, updateField, removeField, moveField, selectField } = builderSlice.actions;

export const selectSelectedField = (state) => state.builder.fields.find((f) => f.id === state.builder.selectedId) || null;

export default builderSlice.reducer;
