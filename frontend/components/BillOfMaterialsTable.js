export default function BillOfMaterialsTable({ billOfMaterials }) {
  if (!billOfMaterials || billOfMaterials.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No bill of materials available
      </div>
    );
  }

  const totalCost = billOfMaterials.reduce((sum, item) => sum + item.totalCost, 0);

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="table-header">Device</th>
            <th className="table-header">Type</th>
            <th className="table-header">Specifications</th>
            <th className="table-header">Quantity</th>
            <th className="table-header">Unit Price</th>
            <th className="table-header">Total Cost</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {billOfMaterials.map((item, index) => (
            <tr key={index}>
              <td className="table-cell font-medium">
                {item.device?.modelName || 'Unknown Device'}
              </td>
              <td className="table-cell">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {item.device?.type || 'Unknown'}
                </span>
              </td>
              <td className="table-cell">
                <div className="text-sm text-gray-600">
                  <div>Ports: {item.device?.specifications?.portCount || 'N/A'}</div>
                  <div>PoE: {item.device?.specifications?.poeCapable ? 'Yes' : 'No'}</div>
                </div>
              </td>
              <td className="table-cell font-medium">
                {item.quantity}
              </td>
              <td className="table-cell">
                ${item.unitPrice?.toLocaleString() || '0'}
              </td>
              <td className="table-cell font-medium">
                ${item.totalCost?.toLocaleString() || '0'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td colSpan="5" className="table-cell font-bold text-right">
              Total Cost:
            </td>
            <td className="table-cell font-bold text-lg">
              ${totalCost.toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
