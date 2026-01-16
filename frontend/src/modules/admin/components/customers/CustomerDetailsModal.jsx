import { useState, useEffect } from 'react';
import Modal from '../../../../shared/components/ui/Modal';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const CustomerDetailsModal = ({ customer, isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name || '',
                email: customer.email || '',
                isActive: customer.isActive !== undefined ? customer.isActive : true
            });
        }
    }, [customer]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token && token !== 'null') {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/customers/${customer._id}`, {
                method: 'PUT',
                headers,
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                onClose();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to update customer');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Customer">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <Input
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled // Email usually shouldn't be changed for safety
                />

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Active Account
                    </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" loading={loading}>
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CustomerDetailsModal;
