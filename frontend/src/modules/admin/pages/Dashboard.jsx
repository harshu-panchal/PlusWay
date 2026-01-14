import Card from '../../../shared/components/ui/Card';

const Dashboard = () => {
    const stats = [
        { label: 'Total Products', value: '0', icon: '📦', color: 'bg-blue-500' },
        { label: 'Total Orders', value: '0', icon: '🛒', color: 'bg-green-500' },
        { label: 'Total Customers', value: '0', icon: '👥', color: 'bg-purple-500' },
        { label: 'Revenue', value: '₹0', icon: '💰', color: 'bg-yellow-500' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <Card key={stat.label} className="flex items-center space-x-4">
                        <div className={`w-16 h-16 ${stat.color} rounded-lg flex items-center justify-center text-3xl`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <Card>
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <p className="text-gray-600">No recent activity</p>
            </Card>
        </div>
    );
};

export default Dashboard;
