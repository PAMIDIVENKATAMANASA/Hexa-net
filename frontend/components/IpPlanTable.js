export default function IpPlanTable({ ipPlan }) {
  if (!ipPlan || ipPlan.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No IP plan available
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="table-header">VLAN ID</th>
            <th className="table-header">Department</th>
            <th className="table-header">Subnet</th>
            <th className="table-header">Subnet Mask</th>
            <th className="table-header">Network Address</th>
            <th className="table-header">Broadcast Address</th>
            <th className="table-header">Usable Hosts</th>
            <th className="table-header">Required Hosts</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {ipPlan.map((vlan, index) => (
            <tr key={index}>
              <td className="table-cell font-medium">
                {vlan.vlanId}
              </td>
              <td className="table-cell font-medium">
                {vlan.departmentName}
              </td>
              <td className="table-cell font-mono text-sm">
                {vlan.subnet}
              </td>
              <td className="table-cell font-mono text-sm">
                {vlan.subnetMask}
              </td>
              <td className="table-cell font-mono text-sm">
                {vlan.networkAddress}
              </td>
              <td className="table-cell font-mono text-sm">
                {vlan.broadcastAddress}
              </td>
              <td className="table-cell">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {vlan.usableHosts}
                </span>
              </td>
              <td className="table-cell">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {vlan.hostCount}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
