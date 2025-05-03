import React, { useState } from "react";

const DataTable = ({ data, setData }) => {
  if (!data || data.length === 0) {
    return <p>No data available</p>;
  }

  const headers = Object.keys(data[0]);

  const handleCellChange = (e, rowIndex, header) => {
    const newData = [...data];
    newData[rowIndex][header] = e.target.value;
    setData(newData);
  };

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) => value && value.trim() !== "")
  );

  return (
    <div className="data-table-container">
      <h2 className="text-xl font-semibold mb-4 text-center">Uploaded Data</h2>
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header) => (
                <td key={header}>
                  <input
                    type="text"
                    value={row[header]}
                    onChange={(e) => handleCellChange(e, rowIndex, header)}
                    className="input-cell"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
