import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';

const DeliveryBoyModal = ({ isOpen, onClose, deliveryBoy, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        vehicleType: 'bike',
        vehicleNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (deliveryBoy) {
            setFormData({
                name: deliveryBoy.name || '',
                email: deliveryBoy.email || '',
                password: '', // Don't show password on edit
                phone: deliveryBoy.phone || '',
                vehicleType: deliveryBoy.vehicleType || 'bike',
                vehicleNumber: deliveryBoy.vehicleNumber || ''
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                vehicleType: 'bike',
                vehicleNumber: ''
            });
        }
    }, [deliveryBoy]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const url = deliveryBoy
                ? `${import.meta.env.VITE_API_BASE_URL}/delivery/admin/${deliveryBoy._id}`
                : `${import.meta.env.VITE_API_BASE_URL}/delivery/admin/create`;

            const method = deliveryBoy ? 'PUT' : 'POST';

            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                method,
                headers,
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800">
                        {deliveryBoy ? 'Edit Delivery Boy' : 'Add New Delivery Boy'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                    />

                    <Input
                        label={deliveryBoy ? "New Password (Optional)" : "Password"}
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!deliveryBoy}
                        placeholder="******"
                    />

                    <Input
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+91 98765 43210"
                    />

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Vehicle Type</label>
                        <select
                            name="vehicleType"
                            value={formData.vehicleType}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        >
                            <option value="bike">Bike</option>
                            <option value="scooter">Scooter</option>
                            <option value="cycle">Cycle</option>
                            <option value="car">Car</option>
                        </select>
                    </div>

                    <Input
                        label="Vehicle Number"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                        placeholder="MH 12 AB 1234"
                    />

                    <div className="pt-2 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Details'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeliveryBoyModal;
