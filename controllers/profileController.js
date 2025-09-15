const bcrypt = require('bcrypt');

// Render change password page
const renderChangePassword = (req, res, role) => {
  const validRoles = ['user', 'dietitian', 'admin', 'organization'];
  if (!validRoles.includes(role)) {
    return res.status(400).render('error', {
      message: 'Invalid Role',
      error: 'The specified role is not valid.',
      backLink: '/roles_signin',
      backLinkText: 'Go to Sign In'
    });
  }
  res.render('change-pass', { role });
};

// Verify current password
const verifyPass = async (req, res) => {
  const { currentPassword } = req.body;
  if (!currentPassword) {
    return res.status(400).json({ success: false, message: 'Current password is required' });
  }

  try {
    const isMatch = await bcrypt.compare(currentPassword, req.entity.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid current password' });
    }
    res.json({ success: true, message: 'Password verified' });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update password
const updatePass = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'New passwords do not match' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
  }

  try {
    const isMatch = await bcrypt.compare(currentPassword, req.entity.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await req.model.findByIdAndUpdate(
      req.entity._id,
      { password: hashedPassword },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Allowed fields for updates
const allowedFields = {
  user: ['name', 'email', 'phone', 'dob', 'gender', 'address', 'age'],
  admin: ['name', 'email', 'phone', 'dob', 'gender', 'address', 'admin_key'],
  dietitian: ['name', 'email', 'phone', 'age', 'interestedField', 'degreeType', 'licenseIssuer', 'idProofType', 'specializationDomain'],
  organization: ['org_name', 'email', 'phone', 'address', 'org_id']
};

// Render edit profile page with entity data
const renderEditProfile = async (req, res, role, sessionKey) => {
  try {
    const entity = await req.model.findById(req.session[sessionKey].id).select('-password -profileImage -files').lean();
    if (!entity) {
      console.error(`${role} not found for ID:`, req.session[sessionKey].id);
      return res.status(404).render('error', { message: `${role} not found`, error: `${role} not found` });
    }
    console.log(`${role} profile data:`, entity);
    const profile = {
      _id: entity._id?.toString() || '',
      name: entity.name || entity.org_name || '',
      email: entity.email || '',
      phone: entity.phone || '',
      dob: entity.dob ? new Date(entity.dob).toISOString().split('T')[0] : '',
      gender: entity.gender || '',
      address: entity.address || '',
      age: entity.age || '',
      admin_key: entity.admin_key || '',
      org_id: entity.org_id || '',
      interestedField: entity.interestedField || '',
      degreeType: entity.degreeType || '',
      licenseIssuer: entity.licenseIssuer || '',
      idProofType: entity.idProofType || '',
      specializationDomain: entity.specializationDomain || ''
    };
    res.render('edit-profile', { profile, role });
  } catch (error) {
    console.error(`Error fetching ${role} profile:`, error);
    res.status(500).render('error', { message: 'Server error', error: error.message });
  }
};

// Update entity profile
const updateProfile = async (req, res, role, sessionKey) => {
  try {
    const updates = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (allowedFields[role].includes(key)) {
        updates[key] = value;
      }
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }

    if (updates.email && updates.email !== req.session[sessionKey].email) {
      const existingEntity = await req.model.findOne({ email: updates.email });
      if (existingEntity) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    const entity = await req.model.findByIdAndUpdate(
      req.session[sessionKey].id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -profileImage -files');

    req.session[sessionKey] = {
      id: entity._id,
      email: entity.email,
      name: entity.name || entity.org_name
    };

    res.json({ success: true, message: 'Profile updated successfully', profile: entity });
  } catch (error) {
    console.error(`Error updating ${role} profile:`, error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  renderChangePassword,
  verifyPass,
  updatePass,
  renderEditProfile,
  updateProfile
};