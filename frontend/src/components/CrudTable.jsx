import { Edit3, Search, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import Loading from './Loading';

const getCellValue = (row, column) => {
  if (typeof column.render === 'function') {
    return column.render(row);
  }

  return row[column.accessor] ?? '';
};

const getSearchText = (row, columns) => {
  return columns
    .map((column) => row[column.accessor])
    .filter((value) => value !== undefined && value !== null)
    .join(' ')
    .toLowerCase();
};

const CrudTable = ({
  columns,
  data = [],
  loading = false,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No hay registros disponibles.',
  onEdit,
  onDelete,
  rowKey = 'id'
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return data;
    }

    return data.filter((row) => getSearchText(row, columns).includes(normalizedSearch));
  }, [columns, data, searchTerm]);

  const showActions = Boolean(onEdit || onDelete);

  return (
    <div style={styles.wrapper}>
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={searchPlaceholder}
            style={styles.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <Loading message="Cargando registros..." />
      ) : (
        <div className="table-container" style={styles.tableContainer}>
          <table className="table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.accessor || column.header}>{column.header}</th>
                ))}
                {showActions && <th style={styles.actionsHeader}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={row[rowKey] || row.id || index}>
                  {columns.map((column) => (
                    <td key={column.accessor || column.header}>
                      {getCellValue(row, column)}
                    </td>
                  ))}
                  {showActions && (
                    <td>
                      <div style={styles.actions}>
                        {onEdit && (
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={styles.iconButton}
                            onClick={() => onEdit(row)}
                            title="Editar"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ ...styles.iconButton, ...styles.deleteButton }}
                            onClick={() => onDelete(row)}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + (showActions ? 1 : 0)}
                    style={styles.emptyCell}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  searchBox: {
    width: 'min(100%, 360px)',
    background: 'var(--surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.55rem 0.75rem',
    boxShadow: 'var(--shadow-sm)'
  },
  searchInput: {
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: 'var(--text-main)',
    fontFamily: 'inherit',
    fontSize: '0.875rem'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  actionsHeader: {
    textAlign: 'right'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem'
  },
  iconButton: {
    width: '36px',
    height: '36px',
    padding: 0
  },
  deleteButton: {
    color: 'var(--danger)',
    borderColor: '#fecaca'
  },
  emptyCell: {
    textAlign: 'center',
    padding: '2rem',
    color: 'var(--text-muted)'
  }
};

export default CrudTable;
