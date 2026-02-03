const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config(); // Will look for .env in current directory

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE } = process.env;
const base = PAYPAL_MODE === 'live'
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

console.log('Testing PayPal Credentials...');
console.log('Mode:', PAYPAL_MODE);
console.log('Client ID:', PAYPAL_CLIENT_ID ? 'Loaded' : 'Missing');

const generateAccessToken = async () => {
    try {
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            console.error('Missing credentials in .env');
            process.exit(1);
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
        console.log('Successfully generated access token!');
        return response.data.access_token;
    } catch (error) {
        console.error("Failed to generate Access Token:", error.response ? error.response.data : error.message);
        process.exit(1);
    }
};

generateAccessToken();
