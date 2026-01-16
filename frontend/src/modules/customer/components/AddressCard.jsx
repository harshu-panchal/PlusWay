import React from 'react';
import { MapPin, Edit, Trash2 } from 'lucide-react';

const AddressCard = ({ address, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 relative overflow-hidden group">
            {address.isDefault && (
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs px-2 py-1 rounded-bl-lg font-medium">
                    Default
                </div>
            )}

            <div className="flex items-start mb-3">
                <MapPin className="w-5 h-5 text-indigo-500 mt-1 mr-2 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-gray-800">{address.city}, {address.state}</h3>
                    <p className="text-sm text-gray-500">{address.country} - {address.zipCode}</p>
                </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 pl-7">
                {address.street}
            </p>

            <div className="flex justify-end gap-2 border-t pt-3 mt-2">
                <button
                    onClick={() => onEdit(address)}
                    className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                >
                    <Edit className="w-4 h-4 mr-1.5" />
                    Edit
                </button>
                <button
                    onClick={() => onDelete(address._id)}
                    className="flex items-center px-3 py-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                </button>
            </div>
        </div>
    );
};

export default AddressCard;
