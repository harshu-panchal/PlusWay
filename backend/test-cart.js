// Test script to verify cart operations
// Run with: node test-cart.js

const API_URL = 'http://localhost:5000/api';
const guestId = 'test_guest_' + Date.now();

console.log('🧪 Testing Cart Operations');
console.log('Guest ID:', guestId);

async function testCart() {
    try {
        // 1. Get initial cart (should be empty)
        console.log('\n1️⃣ Getting initial cart...');
        let response = await fetch(`${API_URL}/cart?guestId=${guestId}`);
        let cart = await response.json();
        console.log('Initial cart:', cart);

        // Assuming you have product IDs in your database, use real ones
        // For now, using placeholder - you'll need to replace with real product IDs
        const productIds = [
            '6969e335d68cc635f6791e6a', // Real product IDs from DB
            '6969e337d68cc635f6791e73'
        ];

        // 2. Add first product
        console.log('\n2️⃣ Adding first product...');
        response = await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                guestId,
                productId: productIds[0],
                quantity: 1
            })
        });
        cart = await response.json();
        console.log('Cart after adding product 1:', {
            itemCount: cart.items?.length,
            items: cart.items?.map(i => ({ id: i._id, product: i.product?._id || i.product }))
        });

        // 3. Add second product
        console.log('\n3️⃣ Adding second product...');
        response = await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                guestId,
                productId: productIds[1],
                quantity: 1
            })
        });
        cart = await response.json();
        console.log('Cart after adding product 2:', {
            itemCount: cart.items?.length,
            items: cart.items?.map(i => ({ id: i._id, product: i.product?._id || i.product }))
        });

        if (!cart.items || cart.items.length < 2) {
            console.log('⚠️ Need at least 2 products to test removal. Check if product IDs are valid.');
            return;
        }

        // 4. Remove FIRST item
        const firstItemId = cart.items[0]._id;
        console.log('\n4️⃣ Removing first item:', firstItemId);
        response = await fetch(`${API_URL}/cart/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                guestId,
                itemId: firstItemId
            })
        });
        cart = await response.json();
        console.log('Cart after removal:', {
            itemCount: cart.items?.length,
            items: cart.items?.map(i => ({ id: i._id, product: i.product?._id || i.product }))
        });

        // 5. Verify cart still has items
        if (cart.items.length === 0) {
            console.log('❌ BUG FOUND: Cart is empty after removing 1 item from cart with 2 items!');
        } else if (cart.items.length === 1) {
            console.log('✅ SUCCESS: Cart correctly shows 1 remaining item');
        } else {
            console.log('⚠️  Unexpected: Cart has', cart.items.length, 'items');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCart();
