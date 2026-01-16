import React, { useState, useEffect } from 'react';

const AddressForm = ({ address, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        isDefault: false
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (address) {
            setFormData({
                street: address.street,
                city: address.city,
                state: address.state,
                zipCode: address.zipCode,
                country: address.country,
                isDefault: address.isDefault
            });
        }
    }, [address]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.street) newErrors.street = 'Street is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.zipCode) newErrors.zipCode = 'Zip Code is required';
        if (!formData.country) newErrors.country = 'Country is required';
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.street ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="123 Main St"
                />
                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="New York"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="NY"
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                    <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="10001"
                    />
                    {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="USA"
                    />
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                    Set as default address
                </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
                >
                    {loading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    Save Address
                </button>
            </div>
        </form>
    );
};

export default AddressForm;
