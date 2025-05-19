
import React from 'react';

const DataTable = ({ data = [] }) => {
  if (data.length === 0) {
    return null;
  }

  const totalRows = data.length;
  const displayRows = data.slice(0, 10);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
      <h2 className="text-xl font-bold mb-4">
        Data Preview {totalRows > 10 ? `(${displayRows.length} of ${totalRows} rows)` : `(${totalRows} rows)`}
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Email', 'NRIC Number', 'Phone', 'Key Skills'].map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.nric_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.phone}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {row.keyskilllist}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalRows > 10 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Showing 10 of {totalRows} rows</p>
          <p className="text-xs mt-1">All {totalRows} rows will be processed on submission</p>
        </div>
      )}
    </div>
  );
};

export default DataTable;
