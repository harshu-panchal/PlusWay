const Address = require('../models/Address');

// @desc    Get all addresses for logged in user
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user.id });
        res.status(200).json(addresses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new address
// @route   POST /api/addresses
// @access  Private
exports.addAddress = async (req, res) => {
    try {
        const { street, city, state, zipCode, country, isDefault } = req.body;

        if (isDefault) {
            // If setting as default, unset other default addresses for this user
            await Address.updateMany(
                { user: req.user.id, isDefault: true },
                { isDefault: false }
            );
        }

        const address = await Address.create({
            user: req.user.id,
            street,
            city,
            state,
            zipCode,
            country,
            isDefault
        });

        res.status(201).json(address);
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update an address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res) => {
    try {
        let address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Make sure user owns address
        if (address.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (req.body.isDefault) {
            // If setting as default, unset other default addresses
            await Address.updateMany(
                { user: req.user.id, isDefault: true },
                { isDefault: false }
            );
        }

        address = await Address.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json(address);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Make sure user owns address
        if (address.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await address.deleteOne();

        res.status(200).json({ message: 'Address removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
