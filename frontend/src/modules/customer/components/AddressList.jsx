import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, MapPin } from 'lucide-react';
import AddressCard from './AddressCard';
import AddressForm from './AddressForm';

const AddressList = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fetchAddresses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/addresses', {
                withCredentials: true
            });
            setAddresses(res.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setError('Failed to fetch addresses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleAddClick = () => {
        setEditingAddress(null);
        setModalOpen(true);
        setError(null);
    };

    const handleEditClick = (address) => {
        setEditingAddress(address);
        setModalOpen(true);
        setError(null);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/addresses/${id}`, {
                withCredentials: true
            });
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            alert('Failed to delete address');
        }
    };

    const handleSubmit = async (values) => {
        setSubmitting(true);
        setError(null);
        try {
            if (editingAddress) {
                await axios.put(`http://localhost:5000/api/addresses/${editingAddress._id}`, values, {
                    withCredentials: true
                });
            } else {
                await axios.post('http://localhost:5000/api/addresses', values, {
                    withCredentials: true
                });
            }
            setModalOpen(false);
            fetchAddresses();
        } catch (error) {
            console.error('Error saving address:', error);
            setError(error.response?.data?.message || 'Failed to save address');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                    Saved Addresses
                </h2>
                <button
                    onClick={handleAddClick}
                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add New Address
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {addresses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <MapPin className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">No saved addresses</p>
                    <p className="text-gray-400 text-sm mt-1">Add an address to speed up checkout</p>
                    <button
                        onClick={handleAddClick}
                        className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Add Address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                        <AddressCard
                            key={addr._id}
                            address={addr}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            aria-hidden="true"
                            onClick={() => setModalOpen(false)}
                        ></div>

                        {/* Modal panel */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                                </h3>
                                <AddressForm
                                    address={editingAddress}
                                    onSubmit={handleSubmit}
                                    onCancel={() => setModalOpen(false)}
                                    loading={submitting}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressList;
