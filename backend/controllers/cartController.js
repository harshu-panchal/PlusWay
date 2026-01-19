const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Helper to find cart
const getCartObj = async (req) => {
  const { userId, guestId } = req.query; // Or req.user from middleware
  // If we have a logged in user (assumed passed in query/body for now as auth is WIP)
  if (userId) return await Cart.findOne({ user: userId });
  if (guestId) return await Cart.findOne({ guestId });
  return null;
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.query.userId;
    const { guestId } = req.query;

    if (!userId && !guestId) return res.json({ items: [] });

    let query = {};
    if (userId) {
      query.user = userId;
    } else {
      query.guestId = guestId;
    }

    let cart = await Cart.findOne(query).populate("items.product");

    if (!cart) return res.json({ items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.body.userId;
    const { guestId, productId, quantity = 1, variant } = req.body;

    if (!userId && !guestId)
      return res.status(400).json({ error: "User ID or Guest ID required" });

    let query = {};
    if (userId) {
      query.user = userId;
    } else {
      query.guestId = guestId;
    }

    let cart = await Cart.findOne(query);

    if (!cart) {
      cart = new Cart({
        user: userId,
        guestId: userId ? undefined : guestId,
        items: [],
      });
    }

    // Check availability
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Logic to check if item exists (simple check on productId + variant SKU if exists)
    const itemIndex = cart.items.findIndex((p) => {
      const sameProduct = p.product.toString() === productId;
      const sameVariant =
        (!p.variant && !variant) || p.variant?.sku === variant?.sku;
      return sameProduct && sameVariant;
    });

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Ensure variant is a clean object or undefined
      const cleanVariant =
        variant &&
        typeof variant === "object" &&
        Object.keys(variant).length > 0
          ? {
              sku: variant.sku || undefined,
              name: variant.name || undefined,
              price: variant.price || undefined,
            }
          : undefined;

      cart.items.push({
        product: productId,
        quantity,
        variant: cleanVariant,
      });
    }

    await cart.save();
    // Repopulate for frontend
    await cart.populate("items.product");
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.body.userId;
    const { guestId, itemId, quantity } = req.body;

    console.log("📝 Update cart item - itemId:", itemId, "quantity:", quantity);

    let query = {};
    if (userId) {
      query.user = userId;
    } else {
      query.guestId = guestId;
    }

    let cart = await Cart.findOne(query);
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.id(itemId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        cart.items.pull(itemId);
      }
      await cart.save();
    } else {
      console.log("⚠️ Item not found in cart");
    }

    await cart.populate("items.product");
    res.json(cart);
  } catch (err) {
    console.error("❌ Update cart item error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.body.userId;
    const { guestId, itemId } = req.body;

    console.log("🗑️ Remove from cart - itemId:", itemId);
    console.log("🗑️ userId:", userId, "guestId:", guestId);

    if (!itemId) {
      return res.status(400).json({ error: "Item ID is required" });
    }

    let query = {};
    if (userId) {
      query.user = userId;
    } else {
      query.guestId = guestId;
    }

    let cart = await Cart.findOne(query);
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    console.log("🗑️ Cart items before removal:", cart.items.length);

    // Use Mongoose pull to remove the item by its subdocument ID
    cart.items.pull(itemId);

    await cart.save();
    console.log("🗑️ Cart items after removal:", cart.items.length);

    await cart.populate("items.product");
    res.json(cart);
  } catch (err) {
    console.error("❌ Remove from cart error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.body.userId;
    const { guestId } = req.body;

    let query = {};
    if (userId) {
      query.user = userId;
    } else {
      query.guestId = guestId;
    }

    let cart = await Cart.findOne(query);
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: "Cart cleared", items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
