import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { deleteSubmission, getAllSubmissions } from '../features/submissions/submissionsSlice';
import { Alert, EmptyState, Pagination, SearchBox, SortHeader, Spinner, formatValue } from '../components/common/ui';
import ActionMenu from '../components/common/ActionMenu';
import useDebounce from '../custom_hooks/useDebounce';

const LIMIT = 10;
const OPTION_TYPES = ['select', 'radio', 'checkbox'];
const LIST_KEYS = ['page', 'search', 'from', 'to', 'filterField', 'filterValue', 'sortBy', 'order'];

export default function SubmissionsPage() {
  const { formId } = useParams();
  const dispatch = useDispatch();
  const { items, form, meta, status, error, deleteError } = useSelector((state) => state.submissions);

  // search, filters, sort and page live in the url, so refresh and shared links keep them
  const [params, setParams] = useSearchParams();
  const query = Object.fromEntries(LIST_KEYS.map((key) => [key, params.get(key) || '']));
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const sortBy = query.sortBy || 'createdAt';
  const order = query.order || 'desc';

  const [search, setSearch] = useState(query.search);
  const debouncedSearch = useDebounce(search);

  // changing anything except the page goes back to page 1
  const updateQuery = (changes, keepPage = false) => {
    const next = { ...query, ...changes };
    if (!keepPage) next.page = '';
    setParams(Object.fromEntries(Object.entries(next).filter(([, value]) => value)), { replace: true });
  };

  useEffect(() => {
    if (debouncedSearch !== query.search) updateQuery({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const loadSubmissions = () => {
    const apiParams = { ...query, page, limit: LIMIT, sortBy, order };
    Object.keys(apiParams).forEach((key) => apiParams[key] === '' && delete apiParams[key]);
    dispatch(getAllSubmissions({ formId, ...apiParams }));
  };

  useEffect(() => {
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, formId, params.toString()]);

  const columns = form?.fields || [];
  const optionFields = columns.filter((f) => OPTION_TYPES.includes(f.type));
  const selectedFilterField = optionFields.find((f) => f.key === query.filterField);
  const hasFilters = search || query.from || query.to || query.filterField;

  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm('Delete this submission? This cannot be undone.')) return;
    const response = await dispatch(deleteSubmission(submissionId));
    if (deleteSubmission.fulfilled.match(response)) {
      if (items.length === 1 && page > 1) updateQuery({ page: String(page - 1) }, true);
      else loadSubmissions();
    }
  };

  const clearFilters = () => {
    setSearch('');
    updateQuery({ search: '', from: '', to: '', filterField: '', filterValue: '' });
  };

  const sortProps = { sortBy, order, onSort: (field, nextOrder) => updateQuery({ sortBy: field, order: nextOrder }) };

  return (
    <>
      <div className="page-header">
        <div>
          <Link to="/admin/forms" className="back-link">
            ← All forms
          </Link>
          <h1>Submissions{form ? `: ${form.name}` : ''}</h1>
        </div>
      </div>

      <div className="toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search in answers" />

        {optionFields.length > 0 && (
          <>
            <select
              className="input toolbar-select"
              value={query.filterField}
              onChange={(e) => updateQuery({ filterField: e.target.value, filterValue: '' })}
              aria-label="Filter by field"
            >
              <option value="">Filter by field</option>
              {optionFields.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
            {selectedFilterField && (
              <select
                className="input toolbar-select"
                value={query.filterValue}
                onChange={(e) => updateQuery({ filterValue: e.target.value })}
                aria-label={`${selectedFilterField.label} value`}
              >
                <option value="">Any {selectedFilterField.label.toLowerCase()}</option>
                {selectedFilterField.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        <label className="date-filter">
          <span>From</span>
          <input className="input" type="date" value={query.from} max={query.to || undefined} onChange={(e) => updateQuery({ from: e.target.value })} />
        </label>
        <label className="date-filter">
          <span>To</span>
          <input className="input" type="date" value={query.to} min={query.from || undefined} onChange={(e) => updateQuery({ to: e.target.value })} />
        </label>

        {hasFilters && (
          <button className="btn btn-ghost" onClick={clearFilters}>
            Clear
          </button>
        )}
      </div>

      <Alert>{error || deleteError}</Alert>

      {status === 'loading' && !items.length ? (
        <Spinner />
      ) : !items.length && status === 'succeeded' ? (
        <EmptyState title={hasFilters ? 'No submissions match your filters' : 'No submissions yet'} />
      ) : (
        items.length > 0 && (
          <div className="card table-card">
            <table className="table table-sticky">
              <thead>
                <tr>
                  <SortHeader label="Submitted" field="createdAt" {...sortProps} />
                  {columns.map((c) => (
                    <SortHeader key={c.key} label={c.label} field={c.key} {...sortProps} />
                  ))}
                  <th className="right col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s._id}>
                    <td className="muted nowrap">{new Date(s.createdAt).toLocaleString()}</td>
                    {columns.map((c) => (
                      <td key={c.key} className="truncate">
                        {formatValue(s.data?.[c.key])}
                      </td>
                    ))}
                    <td className="right col-actions">
                      <ActionMenu
                        label="Submission actions"
                        items={[
                          { label: 'View details', to: `/admin/submissions/${s._id}` },
                          { label: 'Delete', danger: true, onClick: () => handleDeleteSubmission(s._id) },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        limit={LIMIT}
        onChange={(p) => updateQuery({ page: String(p) }, true)}
      />
    </>
  );
}
