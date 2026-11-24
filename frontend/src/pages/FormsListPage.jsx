import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { deleteForm, getAllForms } from '../features/forms/formsSlice';
import { Alert, EmptyState, Pagination, SearchBox, SortHeader, Spinner, StatusBadge } from '../components/common/ui';
import ActionMenu from '../components/common/ActionMenu';
import useDebounce from '../custom_hooks/useDebounce';

const LIMIT = 10;

export default function FormsListPage() {
  const dispatch = useDispatch();
  const { items, meta, status, error, deleteError } = useSelector((state) => state.forms);

  // list controls are local state; only the result is in redux
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [query, setQuery] = useState({ page: 1, search: '', status: '', sortBy: 'updatedAt', order: 'desc' });

  // any change except paging goes back to page 1
  const updateQuery = (changes) => setQuery((q) => ({ ...q, page: 1, ...changes }));

  useEffect(() => {
    setQuery((q) => (q.search === debouncedSearch ? q : { ...q, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  const loadForms = () =>
    dispatch(getAllForms({ ...query, limit: LIMIT, search: query.search || undefined, status: query.status || undefined }));

  useEffect(() => {
    loadForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, query]);

  const handleDeleteForm = async (form) => {
    if (!window.confirm(`Delete "${form.name}" and all its submissions? This cannot be undone.`)) return;
    const response = await dispatch(deleteForm(form._id));
    if (deleteForm.fulfilled.match(response)) {
      if (items.length === 1 && query.page > 1) setQuery((q) => ({ ...q, page: q.page - 1 }));
      else loadForms();
    }
  };

  const hasFilters = search || query.status;
  const sortProps = { sortBy: query.sortBy, order: query.order, onSort: (sortBy, order) => updateQuery({ sortBy, order }) };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Forms</h1>
        </div>
        <Link to="/admin/forms/new" className="btn btn-primary">
          + New form
        </Link>
      </div>

      <div className="toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search forms by name" />
        <select className="input toolbar-select" value={query.status} onChange={(e) => updateQuery({ status: e.target.value })} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        {hasFilters && (
          <button
            className="btn btn-ghost"
            onClick={() => {
              setSearch('');
              updateQuery({ search: '', status: '' });
            }}
          >
            Clear
          </button>
        )}
      </div>

      <Alert>{error || deleteError}</Alert>

      {status === 'loading' && !items.length ? (
        <Spinner />
      ) : !items.length ? (
        <EmptyState title={hasFilters ? 'No forms match your search' : 'No forms yet'} />
      ) : (
        <div className="card table-card">
          <table className="table">
            <thead>
              <tr>
                <SortHeader label="Name" field="name" {...sortProps} />
                <SortHeader label="Status" field="status" {...sortProps} />
                <th>Fields</th>
                <SortHeader label="Updated" field="updatedAt" {...sortProps} />
                <th className="right col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr key={f._id}>
                  <td>
                    <Link to={`/admin/forms/${f._id}/edit`} className="strong">
                      {f.name}
                    </Link>
                  </td>
                  <td>
                    <StatusBadge status={f.status} />
                  </td>
                  <td>{f.fieldCount}</td>
                  <td className="muted nowrap">{new Date(f.updatedAt).toLocaleString()}</td>
                  <td className="right col-actions">
                    <ActionMenu
                      label={`Actions for ${f.name}`}
                      items={[
                        { label: 'Edit', to: `/admin/forms/${f._id}/edit` },
                        ...(f.status === 'published' ? [{ label: 'Open form ↗', href: `/forms/${f._id}` }] : []),
                        { label: 'View submissions', to: `/admin/forms/${f._id}/submissions` },
                        { label: 'Delete', danger: true, onClick: () => handleDeleteForm(f) },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        limit={LIMIT}
        onChange={(page) => setQuery((q) => ({ ...q, page }))}
      />
    </>
  );
}
