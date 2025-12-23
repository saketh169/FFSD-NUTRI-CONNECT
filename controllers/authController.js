const { User, Admin, Dietitian, Organization } = require('../models/userModel');
const Progress = require('../models/progressModel');

exports.userSignup = async (req, res) => {
    const { name, email, password, phone, dob, gender, address } = req.body;
    console.log('Received user signup data:', req.body);

    if (!name || !email || !password || !phone || !dob || !gender || !address) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDifference = today.getMonth() - dobDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dobDate.getDate())) {
        age--;
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const newUser = new User({ name, email, password, phone, dob, gender, address, age });
        await newUser.save();

        req.session.user = { id: newUser._id, role: 'user', email: newUser.email, name: newUser.name };
        res.status(200).json({
            success: true,
            message: 'User sign-up successful',
            user: { id: newUser._id, email: newUser.email, name: newUser.name },
        });
    } catch (err) {
        console.error('Error during user sign-up:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

exports.adminSignup = async (req, res) => {
    const { name, email, password, adminKey, phone, dob, gender, address } = req.body;
    console.log('Received admin signup data:', req.body);

    if (!name || !email || !password || !adminKey || !phone || !dob || !gender || !address) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const DEFAULT_ADMIN_KEY = 'Nutri@2025';
    if (adminKey !== DEFAULT_ADMIN_KEY) {
        return res.status(400).json({ success: false, message: 'Invalid admin key.' });
    }

    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const newAdmin = new Admin({ name, email, password, admin_key: adminKey, phone, dob, gender, address });
        await newAdmin.save();

        req.session.admin = { id: newAdmin._id, role: 'admin', email: newAdmin.email, name: newAdmin.name };
        res.status(200).json({
            success: true,
            message: 'Admin sign-up successful',
            admin: { id: newAdmin._id, email: newAdmin.email, name: newAdmin.name },
        });
    } catch (err) {
        console.error('Error during admin sign-up:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

exports.dietitianSignup = async (req, res) => {
    const { name, email, password, age, phone, licenseNumber } = req.body;
    console.log('Received dietitian signup data:', req.body);

    if (!name || !email || !password || !age || !phone || !licenseNumber) {
        return res.status(400).json({ success: false, message: 'Required fields are missing.' });
    }

    try {
        const existingDietitian = await Dietitian.findOne({ email });
        if (existingDietitian) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const newDietitian = new Dietitian({
            name,
            email,
            password,
            age,
            phone,
            licenseNumber
        });

        await newDietitian.save();
        req.session.dietitian = { id: newDietitian._id, role: 'dietitian', email: newDietitian.email, name: newDietitian.name };
        res.status(200).json({
            success: true,
            message: 'Dietitian sign-up successful',
            dietitian: { id: newDietitian._id, email: newDietitian.email, name: newDietitian.name },
        });
    } catch (err) {
        console.error('Error during dietitian sign-up:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

exports.organizationSignup = async (req, res) => {
    const { org_name, email, password, phone, address, org_id } = req.body;
    console.log('Received organization signup data:', req.body);

    if (!org_name || !email || !password || !phone || !address || !org_id) {
        return res.status(400).json({ success: false, message: 'Required fields are missing.' });
    }

    try {
        const existingOrg = await Organization.findOne({ email });
        if (existingOrg) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const newOrg = new Organization({ org_name, email, password, phone, address, org_id });
        await newOrg.save();

        req.session.organization = { id: newOrg._id, role: 'organization', email: newOrg.email, org_name: newOrg.org_name };
        res.status(200).json({
            success: true,
            message: 'Organization sign-up successful',
            organization: { id: newOrg._id, email: newOrg.email, org_name: newOrg.org_name },
        });
    } catch (err) {
        console.error('Error during organization sign-up:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

exports.userSignin = async (req, res) => {
    const { email, password } = req.body;
    console.log('Received user signin data:', req.body);

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        req.session.user = { id: user._id, role: 'user', email: user.email, name: user.name };
        req.session.save();
        res.status(200).json({
            success: true,
            message: 'User sign-in successful',
            user: { id: user._id, email: user.email, name: user.name },
        });
    } catch (err) {
        console.error('Error during user sign-in:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

exports.adminSignin = async (req, res) => {
    const { email, password , adminKey  } = req.body;
    console.log('Received admin signin data:', req.body);

    if (!email || !password || !adminKey) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
   
    const DEFAULT_ADMIN_KEY = 'Nutri@2025';
    if (adminKey !== DEFAULT_ADMIN_KEY) {
        return res.status(400).json({ success: false, message: 'Invalid admin key.' });
    }

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        req.session.admin = { id: admin._id, role: 'admin', email: admin.email, name: admin.name };
        req.session.save();
        res.status(200).json({
            success: true,
            message: 'Admin sign-in successful',
            admin: { id: admin._id, email: admin.email, name: admin.name },
        });
    } catch (err) {
        console.error('Error during admin sign-in:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

exports.dietitianSignin = async (req, res) => {
    const { email, password } = req.body;
    console.log('Received dietitian signin data:', req.body);

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    try {
        const dietitian = await Dietitian.findOne({ email });
        if (!dietitian) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await dietitian.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        req.session.dietitian = { id: dietitian._id, role: 'dietitian', email: dietitian.email, name: dietitian.name };
        req.session.save();
        res.status(200).json({
            success: true,
            message: 'Dietitian sign-in successful',
            dietitian: { id: dietitian._id, email: dietitian.email, name: dietitian.name },
        });
    } catch (err) {
        console.error('Error during dietitian sign-in:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

exports.organizationSignin = async (req, res) => {
    const { email, password } = req.body;
    console.log('Received organization signin data:', req.body);

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    try {
        const organization = await Organization.findOne({ email });
        if (!organization) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await organization.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        req.session.organization = { id: organization._id, role: 'organization', email: organization.email, org_name: organization.org_name };
        req.session.save();
        res.status(200).json({
            success: true,
            message: 'Organization sign-in successful',
            organization: { id: organization._id, email: organization.email, org_name: organization.org_name },
        });
    } catch (err) {
        console.error('Error during organization sign-in:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

exports.userDashboard = async (req, res) => {
    const userSession = req.session.user;
    if (!userSession) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const user = await User.findById(userSession.id).select('-password').lean();
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.profileImageBase64 = user.profileImage
            ? `data:image/jpeg;base64,${user.profileImage.toString('base64')}`
            : null;

        const progressData = await Progress.find({ userId: userSession.id })
            .sort({ createdAt: -1 })
            .limit(4)
            .lean();

        res.render('dash_user', { title: 'User Dashboard', user, progressData });
    } catch (err) {
        console.error('Error fetching user or progress data:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

exports.adminDashboard = async (req, res) => {
    const adminSession = req.session.admin;
    if (!adminSession) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const admin = await Admin.findById(adminSession.id).select('-password').lean();
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        admin.profileImageBase64 = admin.profileImage
            ? `data:image/jpeg;base64,${admin.profileImage.toString('base64')}`
            : null;
        res.render('dash_admin', { title: 'Admin Dashboard', admin });
    } catch (err) {
        console.error('Error fetching admin data:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

exports.dietitianDashboard = async (req, res) => {
    const dietitianSession = req.session.dietitian;
    if (!dietitianSession) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const dietitian = await Dietitian.findById(dietitianSession.id).select('-password').lean();
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }
        dietitian.profileImageBase64 = dietitian.profileImage
            ? `data:image/jpeg;base64,${dietitian.profileImage.toString('base64')}`
            : null;
        res.render('dash_dietitian', { title: 'Dietitian Dashboard', dietitian });
    } catch (err) {
        console.error('Error fetching dietitian data:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

exports.organizationDashboard = async (req, res) => {
    const organizationSession = req.session.organization;
    if (!organizationSession) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const organization = await Organization.findById(organizationSession.id).select('-password').lean();
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        organization.profileImageBase64 = organization.profileImage
            ? `data:image/jpeg;base64,${organization.profileImage.toString('base64')}`
            : null;
        res.render('dash_organization', { title: 'Organization Dashboard', organization });
    } catch (err) {
        console.error('Error fetching organization data:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};