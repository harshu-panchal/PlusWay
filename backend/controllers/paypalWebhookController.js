const paypal = require('../services/paypalService');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');

exports.handleWebhook = async (req, res) => {
    const event = req.body;

    console.log('PayPal Webhook Received:', event.event_type);

    try {
        // Verify webhook signature (Optional but recommended for production)
        // For simplicity in this example, we proceed. In production, use PayPal's verification.

        switch (event.event_type) {
            case 'CHECKOUT.ORDER.APPROVED':
                // Handled by frontend usually, but good to have as fallback
                break;

            case 'PAYMENT.CAPTURE.COMPLETED':
                const capture = event.resource;
                const paypalOrderId = capture.supplementary_data?.related_ids?.order_id;

                if (paypalOrderId) {
                    const order = await Order.findOne({ 'paymentDetails.paypal_order_id': paypalOrderId });
                    if (order && order.paymentStatus !== 'Paid') {
                        order.paymentStatus = 'Paid';
                        order.paymentDetails.paypal_capture_id = capture.id;
                        await order.save();

                        // Create Transaction record if not exists
                        const existingTx = await Transaction.findOne({ transactionId: capture.id });
                        if (!existingTx) {
                            await Transaction.create({
                                orderId: order._id,
                                transactionId: capture.id,
                                amount: order.totalAmount,
                                status: 'success',
                                breakdown: { subtotal: order.totalAmount, platformFee: 0 }
                            });
                        }
                    }
                }
                break;

            case 'PAYMENT.CAPTURE.REFUNDED':
                // Handle refunds
                break;

            default:
                console.log(`Unhandled PayPal event type: ${event.event_type}`);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('PayPal Webhook Error:', error);
        res.status(500).send('Webhook Handle Failed');
    }
};
