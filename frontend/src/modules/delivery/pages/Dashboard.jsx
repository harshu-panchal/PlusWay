import Card from '../../../shared/components/ui/Card';

const Dashboard = () => {
    const stats = [
        { label: 'Pending Deliveries', value: '0', icon: '📦', color: 'bg-orange-500' },
        { label: 'Completed Today', value: '0', icon: '✅', color: 'bg-green-500' },
        { label: 'Total Deliveries', value: '0', icon: '🚚', color: 'bg-blue-500' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Delivery Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <h2 className="text-xl font-semibold mb-4">Today's Deliveries</h2>
                <p className="text-gray-600">No deliveries assigned</p>
            </Card>
        </div>
    );
};

export default Dashboard;
