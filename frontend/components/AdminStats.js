export default function AdminStats({ stats }) {
  if (!stats) {
    return <div>Loading statistics...</div>;
  }

  const statCards = [
    {
      title: 'Total Requests',
      value: stats.requests?.total || 0,
      color: 'bg-blue-500',
      icon: '📋'
    },
    {
      title: 'New Requests',
      value: stats.requests?.new || 0,
      color: 'bg-yellow-500',
      icon: '🆕'
    },
    {
      title: 'In Progress',
      value: stats.requests?.inProgress || 0,
      color: 'bg-purple-500',
      icon: '⚙️'
    },
    {
      title: 'Completed',
      value: stats.requests?.completed || 0,
      color: 'bg-green-500',
      icon: '✅'
    },
    {
      title: 'Total Users',
      value: stats.users?.total || 0,
      color: 'bg-indigo-500',
      icon: '👥'
    },
    {
      title: 'Device Models',
      value: stats.devices?.total || 0,
      color: 'bg-red-500',
      icon: '🔧'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color} text-white`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
