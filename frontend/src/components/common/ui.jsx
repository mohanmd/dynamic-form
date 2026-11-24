export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="spinner-wrap" role="status">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function Alert({ type = 'error', children }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type}`} role="alert">
      <span>{children}</span>
    </div>
  );
}

export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

export function EmptyState({ title, children }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

// page numbers to show, e.g. 1 … 4 5 6 … 12
function pageList(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const list = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) list.push('gap-' + p);
    list.push(p);
  });
  return list;
}

export function Pagination({ page, totalPages, total, limit = 10, onChange }) {
  if (!total) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {from}–{to} of {total}
      </span>
      {totalPages > 1 && (
        <div className="pagination-buttons">
          <button className="page-btn" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
            ‹
          </button>
          {pageList(page, totalPages).map((p) =>
            typeof p === 'string' ? (
              <span key={p} className="page-gap">
                …
              </span>
            ) : (
              <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onChange(p)}>
                {p}
              </button>
            )
          )}
          <button className="page-btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
            ›
          </button>
        </div>
      )}
    </div>
  );
}

// table header cell that sorts when clicked; arrow shows the current order
export function SortHeader({ label, field, sortBy, order, onSort, className = '' }) {
  const active = sortBy === field;
  const nextOrder = active && order === 'asc' ? 'desc' : 'asc';
  return (
    <th className={`sortable ${active ? 'sorted' : ''} ${className}`} aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" onClick={() => onSort(field, nextOrder)}>
        {label}
        <span className="sort-arrow">{active ? (order === 'asc' ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  );
}

export function SearchBox({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="search-box">
      <input className="input" type="search" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// arrays -> "a, b", empty -> dash
export function formatValue(value) {
  if (value === undefined || value === null || value === '') return <span className="muted">—</span>;
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}
