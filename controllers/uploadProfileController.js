const { User, Admin, Dietitian, Organization } = require('../models/userModel');

// Upload profile image for User
async function uploadUserProfileImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const userId = req.session.user.id;
        const user = await User.findByIdAndUpdate(
            userId,
            { profileImage: req.file.buffer },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading user profile photo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload profile photo'
        });
    }
}

// Upload profile image for Admin
async function uploadAdminProfileImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const adminId = req.session.admin.id;
        const admin = await Admin.findByIdAndUpdate(
            adminId,
            { profileImage: req.file.buffer },
            { new: true }
        );

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading admin profile photo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload profile photo'
        });
    }
}

// Upload profile image for Dietitian
async function uploadDietitianProfileImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const dietitianId = req.session.dietitian.id;
        const dietitian = await Dietitian.findByIdAndUpdate(
            dietitianId,
            { profileImage: req.file.buffer },
            { new: true }
        );

        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading dietitian profile photo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload profile photo'
        });
    }
}

// Upload profile image for Organization
async function uploadOrganizationProfileImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const orgId = req.session.organization.id;
        const organization = await Organization.findByIdAndUpdate(
            orgId,
            { profileImage: req.file.buffer },
            { new: true }
        );

        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading organization profile photo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload profile photo'
        });
    }
}

module.exports = {
    uploadUserProfileImage,
    uploadAdminProfileImage,
    uploadDietitianProfileImage,
    uploadOrganizationProfileImage
};