// Bearer header for admin requests. The API uses it to tell admins apart from shoppers,
// e.g. admins still see products and brands that are hidden on the storefront.
export const adminAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};
