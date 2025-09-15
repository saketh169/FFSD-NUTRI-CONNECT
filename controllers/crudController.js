const { User, Dietitian, RemovedAccounts, Organization } = require('../models/userModel');
const mongoose = require('mongoose');
const DietPlan = require('../models/dietPlanModel');


const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

function errorHandler(err, req, res, next) {
    console.error('Route error:', err.stack);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
}


// GET all active users
const getUsersList = asyncHandler(async (req, res) => {
    const users = await User.find({ isDeleted: false })
        .select('name email phone dob gender address age createdAt')
        .sort({ createdAt: -1 });
    console.log('Users query result:', users);
    console.log('Users fetched:', users.length);
    res.json({ success: true, data: users });
});

// GET all active dietitians
const getDietitianList = asyncHandler(async (req, res) => {
    const dietitians = await Dietitian.find({ isDeleted: false })
        .select('name email age phone createdAt verificationStatus')
        .sort({ createdAt: -1 });
    console.log('Dietitians query result:', dietitians);
    console.log('Dietitians fetched:', dietitians.length);
    res.json({ success: true, data: dietitians });
});

// GET all removed accounts
const getRemovedAccounts = asyncHandler(async (req, res) => {
    const removedAccounts = await RemovedAccounts.find()
        .sort({ deletedAt: -1 });
    
    const formattedAccounts = removedAccounts.map(account => ({
        id: account._id,
        originalId: account.originalId,
        accountType: account.accountType,
        name: account.name,
        email: account.email,
        phone: account.phone,
        removedOn: account.deletedAt ? account.deletedAt.toISOString().split('T')[0] : 'N/A',
        ...account.additionalData
    }));
    
    console.log('Removed accounts query result:', formattedAccounts);
    console.log('Removed accounts fetched:', formattedAccounts.length);
    res.json({ success: true, data: formattedAccounts });
});

// DELETE a user (soft delete)
const deleteUser = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isDeleted = true;
    await user.save();

    const deletedAccount = new RemovedAccounts({
        accountType: 'User',
        originalId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        additionalData: {
            dob: user.dob,
            gender: user.gender,
            address: user.address,
            age: user.age
        }
    });

    console.log('Removed account to save:', deletedAccount);
    await deletedAccount.save();
    console.log('Removed account saved:', deletedAccount._id);
    console.log('Removed account deletedAt:', deletedAccount.deletedAt);

    console.log('User deleted:', req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
});

// DELETE a dietitian (soft delete)
const deleteDietitian = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Invalid dietitian ID' });
    }
    const dietitian = await Dietitian.findOne({ _id: req.params.id, isDeleted: false });
    if (!dietitian) {
        return res.status(404).json({ success: false, message: 'Dietitian not found' });
    }

    dietitian.isDeleted = true;
    await dietitian.save();

    const deletedAccount = new RemovedAccounts({
        accountType: 'Dietitian',
        originalId: dietitian._id,
        name: dietitian.name,
        email: dietitian.email,
        phone: dietitian.phone,
        additionalData: {
            age: dietitian.age,
            verificationStatus: dietitian.verificationStatus
        }
    });

    console.log('Removed account to save:', deletedAccount);
    await deletedAccount.save();
    console.log('Removed account saved:', deletedAccount._id);
    console.log('Removed account deletedAt:', deletedAccount.deletedAt);

    console.log('Dietitian deleted:', req.params.id);
    res.json({ success: true, message: 'Dietitian deleted successfully' });
});

// POST restore an account
const restoreAccount = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        console.error('Invalid account ID:', req.params.id);
        return res.status(400).json({ success: false, message: 'Invalid account ID' });
    }
    const deletedAccount = await RemovedAccounts.findById(req.params.id);
    if (!deletedAccount) {
        console.error('Removed account not found:', req.params.id);
        return res.status(404).json({ success: false, message: 'Removed account not found' });
    }

    console.log('Found removed account:', deletedAccount);

    const accountType = deletedAccount.accountType.toLowerCase();
    if (accountType === 'user') {
        let user = await User.findById(deletedAccount.originalId);
        if (user) {
            user.isDeleted = false;
            await user.save();
            console.log('User restored:', user._id);
        } else {
            user = new User({
                _id: deletedAccount.originalId,
                name: deletedAccount.name,
                email: deletedAccount.email,
                phone: deletedAccount.phone,
                dob: deletedAccount.additionalData.dob,
                gender: deletedAccount.additionalData.gender,
                address: deletedAccount.additionalData.address,
                age: deletedAccount.additionalData.age,
                password: 'temporary_password',
                isDeleted: false
            });
            await user.save();
            console.log('New user created and restored:', user._id);
        }
    } else if (accountType === 'dietitian') {
        let dietitian = await Dietitian.findById(deletedAccount.originalId);
        if (dietitian) {
            dietitian.isDeleted = false;
            await dietitian.save();
            console.log('Dietitian restored:', dietitian._id);
        } else {
            dietitian = new Dietitian({
                _id: deletedAccount.originalId,
                name: deletedAccount.name,
                email: deletedAccount.email,
                phone: deletedAccount.phone,
                age: deletedAccount.additionalData.age,
                verificationStatus: deletedAccount.additionalData.verificationStatus || 'pending',
                password: 'temporary_password',
                isDeleted: false
            });
            await dietitian.save();
            console.log('New dietitian created and restored:', dietitian._id);
        }
    } else {
        console.error('Invalid account type:', accountType);
        return res.status(400).json({ success: false, message: 'Invalid account type' });
    }

    await deletedAccount.deleteOne();
    console.log('Removed account removed:', req.params.id);

    res.json({ success: true, message: 'Account restored successfully' });
});

// GET search removed accounts
const searchRemovedAccounts = asyncHandler(async (req, res) => {
    const searchTerm = req.query.q || '';
    const removedAccounts = await RemovedAccounts.find({
        $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } },
            { phone: { $regex: searchTerm, $options: 'i' } },
            { accountType: { $regex: searchTerm, $options: 'i' } }
        ]
    }).sort({ deletedAt: -1 });

    const formattedAccounts = removedAccounts.map(account => ({
        id: account._id,
        originalId: account.originalId,
        accountType: account.accountType.toLowerCase(),
        name: account.name,
        email: account.email,
        phone: account.phone,
        removedOn: account.deletedAt ? account.deletedAt.toISOString().split('T')[0] : 'N/A',
        ...account.additionalData
    }));
    
    console.log('Removed accounts search query result:', formattedAccounts);
    console.log('Removed accounts searched:', formattedAccounts.length);
    res.json({ success: true, data: formattedAccounts });
});

// GET search users
const searchUsers = asyncHandler(async (req, res) => {
    const searchTerm = req.query.q || '';
    const users = await User.find({
        isDeleted: false,
        $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } },
            { phone: { $regex: searchTerm, $options: 'i' } }
        ]
    }).select('name email phone dob gender address age createdAt');
    console.log('Users search query result:', users);
    console.log('Users searched:', users.length);
    res.json({ success: true, data: users });
});

// GET search dietitians
const searchDietitians = asyncHandler(async (req, res) => {
    const searchTerm = req.query.q || '';
    const dietitians = await Dietitian.find({
        isDeleted: false,
        $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } },
            { phone: { $regex: searchTerm, $options: 'i' } }
        ]
    }).select('name email age phone createdAt verificationStatus');
    console.log('Dietitians search query result:', dietitians);
    console.log('Dietitians searched:', dietitians.length);
    res.json({ success: true, data: dietitians });
});

// Get count of verified organizations
const getVerifiedOrganizationsCount = asyncHandler(async (req, res) => {
    const count = await Organization.countDocuments({ 'verificationStatus.finalReport': 'Verified' });
    res.json({ success: true, data: count });
});

// Get count of all dietitian diet plans
const getActiveDietPlansCount = asyncHandler(async (req, res) => {
    const count = await DietPlan.countDocuments({});
    res.json({ success: true, data: count });
});

module.exports = {
    getUsersList,
    getDietitianList,
    getRemovedAccounts,
    deleteUser,
    deleteDietitian,
    restoreAccount,
    searchRemovedAccounts,
    searchUsers,
    searchDietitians,
    getVerifiedOrganizationsCount,
    getActiveDietPlansCount
};