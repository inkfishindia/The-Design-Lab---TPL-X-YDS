
import React from 'react';
import type { NotionTableData } from '../types';

interface NotionTableProps {
  data: NotionTableData;
}

export const NotionTable: React.FC<NotionTableProps> = ({ data }) => {
    if (data.rows.length === 0) {
        return <p className="text-sm text-center text-text-muted">This database is empty.</p>;
    }
    return (
        <div className="max-w-full overflow-x-auto rounded-lg border border-dark-border">
            <table className="min-w-full text-sm text-left text-text-light">
                <thead className="text-xs text-text-muted uppercase bg-dark-bg/50">
                    <tr>
                        {data.headers.map((header, index) => (
                            <th key={index} scope="col" className="px-4 py-2 font-semibold">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-dark-surface">
                    {data.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-dark-border last:border-b-0 hover:bg-dark-border/50">
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-2 align-top">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
