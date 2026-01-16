import { useEffect } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { closeCart, updateCartItem, removeCartItem } from '../store/slices/cartSlice';
import { Link } from 'react-router-dom';
import Button from '../../../shared/components/ui/Button';

const CartDrawer = () => {
    const dispatch = useDispatch();
    const { items, totalAmount, isOpen, loading } = useSelector((state) => state.cart);

    const handleUpdateQuantity = (itemId, newQty) => {
        if (newQty < 1) return;
        dispatch(updateCartItem({ itemId, quantity: newQty }));
    };

    const handleRemove = (itemId) => {
        dispatch(removeCartItem(itemId));
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => dispatch(closeCart())}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                            <div className="flex items-start justify-between">
                                                <Dialog.Title className="text-lg font-medium text-gray-900">
                                                    Shopping Cart
                                                </Dialog.Title>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                                                        onClick={() => dispatch(closeCart())}
                                                    >
                                                        <span className="absolute -inset-0.5" />
                                                        <span className="sr-only">Close panel</span>
                                                        <X className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-8">
                                                <div className="flow-root">
                                                    {items.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center py-10 text-center">
                                                            <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
                                                            <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
                                                            <p className="text-gray-500 mt-1">Looks like you haven't added anything to your cart yet.</p>
                                                            <Button
                                                                className="mt-6"
                                                                onClick={() => dispatch(closeCart())}
                                                            >
                                                                Start Shopping
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                                                            {items.map((item) => (
                                                                <li key={item._id} className="flex py-6">
                                                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50 p-2">
                                                                        <img
                                                                            src={item.product?.mainImage}
                                                                            alt={item.product?.title}
                                                                            className="h-full w-full object-contain object-center"
                                                                        />
                                                                    </div>

                                                                    <div className="ml-4 flex flex-1 flex-col">
                                                                        <div>
                                                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                                                <h3 className="line-clamp-2 pr-4">{item.product?.title}</h3>
                                                                                <p className="ml-4 whitespace-nowrap">₹{item.variant?.price || item.product?.basePrice}</p>
                                                                            </div>
                                                                            {item.variant && (
                                                                                <p className="mt-1 text-sm text-gray-500">{item.variant.name}</p>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-1 items-end justify-between text-sm">
                                                                            <div className="flex items-center border rounded-lg bg-gray-50">
                                                                                <button
                                                                                    onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                                                                    className="p-1 hover:text-teal-600 disabled:opacity-50"
                                                                                    disabled={loading}
                                                                                >
                                                                                    <Minus className="w-4 h-4" />
                                                                                </button>
                                                                                <span className="px-2 font-medium w-8 text-center">{item.quantity}</span>
                                                                                <button
                                                                                    onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                                                                    className="p-1 hover:text-teal-600 disabled:opacity-50"
                                                                                    disabled={loading}
                                                                                >
                                                                                    <Plus className="w-4 h-4" />
                                                                                </button>
                                                                            </div>

                                                                            <div className="flex">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleRemove(item._id)}
                                                                                    className="font-medium text-red-500 hover:text-red-600 flex items-center gap-1"
                                                                                    disabled={loading}
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                    <span className="hidden sm:inline">Remove</span>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {items.length > 0 && (
                                            <div className="border-t border-gray-200 px-4 py-6 sm:px-6 bg-white">
                                                <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                                                    <p>Subtotal</p>
                                                    <p>₹{totalAmount}</p>
                                                </div>
                                                <p className="mt-0.5 text-sm text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
                                                <div className="space-y-3">
                                                    <Link
                                                        to="/checkout"
                                                        onClick={() => dispatch(closeCart())}
                                                        className="flex items-center justify-center rounded-xl border border-transparent bg-teal-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-teal-700 w-full"
                                                    >
                                                        Checkout
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        className="flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 w-full"
                                                        onClick={() => dispatch(closeCart())}
                                                    >
                                                        Continue Shopping
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default CartDrawer;
