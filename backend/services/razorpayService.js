const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (amount) => {
    const options = {
        amount: Math.round(amount * 100), // Amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.instance = razorpay;
