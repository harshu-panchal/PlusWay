const axios = require('axios');

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE } = process.env;
const base = PAYPAL_MODE === 'live'
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

/**
 * Generate an access token using client id and secret
 */
const generateAccessToken = async () => {
    try {
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            throw new Error("MISSING_API_CREDENTIALS");
        }
        const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
        const response = await axios({
            url: `${base}/v1/oauth2/token`,
            method: 'post',
            data: "grant_type=client_credentials",
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        return response.data.access_token;
    } catch (error) {
        console.error("Failed to generate Access Token:", error);
        throw error;
    }
};

/**
 * Create an order to start the transaction
 */
const createOrder = async (cart) => {
    // cart should be an object with { amount: number, currency: string }
    console.log("Creating PayPal order for cart:", cart);

    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    // Format amount to 2 decimal places string
    const formattedAmount = parseFloat(cart.amount).toFixed(2);

    const payload = {
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: cart.currency || "USD",
                    value: formattedAmount,
                },
            },
        ],
        application_context: {
            brand_name: "PlusWay",
            landing_page: "NO_PREFERENCE",
            user_action: "PAY_NOW",
            shipping_preference: "NO_SHIPPING" // Adjust if you want PayPal to handle shipping info
        }
    };

    console.log("PayPal Request Payload:", JSON.stringify(payload, null, 2));

    const response = await axios({
        url,
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        data: JSON.stringify(payload),
    });

    console.log("PayPal API Response Status:", response.status);
    const data = await handleResponse(response);
    console.log("PayPal Order Created Success:", data.id);
    return data;
};

/**
 * Capture payment for an existing order
 */
const capturePayment = async (orderId) => {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;

    const response = await axios({
        url,
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return handleResponse(response);
};

async function handleResponse(response) {
    if (response.status >= 200 && response.status < 300) {
        return response.data;
    }

    const errorMessage = response.data;
    throw new Error(JSON.stringify(errorMessage));
}

module.exports = { createOrder, capturePayment };
