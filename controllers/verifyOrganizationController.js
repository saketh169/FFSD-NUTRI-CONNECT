const mongoose = require('mongoose');
const { Organization } = require('../models/userModel');

// Handle organization file uploads and mark as Pending
async function uploadOrganizationFiles(req, res) {
    try {
        const organization = req.session.organization;
        if (!organization || organization.role !== 'organization') {
            return res.status(403).json({ success: false, message: 'Unauthorized: Only organizations can upload files' });
        }

        let fileDetails = 'Uploaded Files:\n';
        const filesUpdate = {};
        const verificationStatusUpdate = {};

        const fieldMap = {
            org_logo: 'org_logo',
            org_brochure: 'org_brochure',
            legal_document: 'legal_document',
            tax_document: 'tax_document',
            address_proof: 'address_proof',
            business_license: 'business_license',
            authorized_rep_id: 'authorized_rep_id',
            bank_document: 'bank_document'
        };

        for (const field in req.files) {
            req.files[field].forEach(file => {
                fileDetails += `Field: ${field}\n`;
                fileDetails += `Original Name: ${file.originalname}\n`;
                fileDetails += `MIME Type: ${file.mimetype}\n`;
                fileDetails += `Size: ${file.size} bytes\n`;
                fileDetails += '---------------------------\n';

                const schemaField = fieldMap[field];
                if (schemaField) {
                    filesUpdate[`files.${schemaField}`] = file.buffer;
                    verificationStatusUpdate[`verificationStatus.${schemaField}`] = 'Pending';
                }
            });
        }

        console.log(fileDetails);

        const unsetFields = {};
        const existingOrganization = await Organization.findById(organization.id);
        if (existingOrganization.files && existingOrganization.files.finalReport) {
            unsetFields['files.finalReport'] = '';
            console.log(`Removing existing final report for organization: ${organization.org_name}`);
        }

        const updatedOrganization = await Organization.findByIdAndUpdate(
            organization.id,
            {
                $set: {
                    ...filesUpdate,
                    ...verificationStatusUpdate,
                    'verificationStatus.finalReport': 'Not Received'
                },
                $unset: unsetFields
            },
            { new: true }
        );

        if (!updatedOrganization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        req.session.organization = {
            id: updatedOrganization._id,
            role: 'organization',
            email: updatedOrganization.email,
            org_name: updatedOrganization.org_name
        };

        res.status(200).json({
            success: true,
            message: 'Files uploaded and marked as Pending successfully!',
            files: req.files,
            organization: {
                id: updatedOrganization._id,
                email: updatedOrganization.email,
                org_name: updatedOrganization.org_name,
                verificationStatus: updatedOrganization.verificationStatus
            }
        });
    } catch (err) {
        console.error('Error uploading files:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
}

// Fetch all organizations and log file statuses
async function getOrganizations(req, res) {
    try {
        const organizations = await Organization.find().select('org_name email files verificationStatus');

        console.log('Organizations with Verified Files:');
        organizations.forEach((org) => {
            const verifiedFiles = Object.keys(org.verificationStatus || {})
                .filter((key) => org.verificationStatus[key] === 'Verified')
                .map((key) => {
                    const fieldMap = {
                        org_logo: 'Organization Logo',
                        org_brochure: 'Organization Brochure',
                        legal_document: 'Legal Document',
                        tax_document: 'Tax Document',
                        address_proof: 'Proof of Address',
                        business_license: 'Business License',
                        authorized_rep_id: 'Identity Proof',
                        bank_document: 'Bank Document',
                        finalReport: 'Final Report'
                    };
                    return fieldMap[key] || key;
                });
            if (verifiedFiles.length > 0) {
                console.log(`- ${org.org_name}: ${verifiedFiles.join(', ')}`);
            }
        });

        console.log('\nOrganizations with Rejected Files:');
        organizations.forEach((org) => {
            const rejectedFiles = Object.keys(org.verificationStatus || {})
                .filter((key) => org.verificationStatus[key] === 'Rejected')
                .map((key) => {
                    const fieldMap = {
                        org_logo: 'Organization Logo',
                        org_brochure: 'Organization Brochure',
                        legal_document: 'Legal Document',
                        tax_document: 'Tax Document',
                        address_proof: 'Proof of Address',
                        business_license: 'Business License',
                        authorized_rep_id: 'Identity Proof',
                        bank_document: 'Bank Document',
                        finalReport: 'Final Report'
                    };
                    return fieldMap[key] || key;
                });
            if (rejectedFiles.length > 0) {
                console.log(`- ${org.org_name}: ${rejectedFiles.join(', ')}`);
            }
        });

        res.status(200).json(organizations);
    } catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch organizations' });
    }
}

// Fetch an organization file as base64
async function getOrganizationFile(req, res) {
    try {
        const { orgId, field } = req.params;
        const validFields = [
            'org_logo', 'org_brochure', 'legal_document', 'tax_document',
            'address_proof', 'business_license', 'authorized_rep_id',
            'bank_document', 'finalReport'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        const files = organization.files || {};
        const fileBuffer = files[field];
        if (!fileBuffer || fileBuffer.length === 0) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        const base64Data = fileBuffer.toString('base64');
        const fieldMap = {
            org_logo: { name: 'Organization Logo', ext: 'png', mime: 'image/png' },
            org_brochure: { name: 'Organization Brochure', ext: 'pdf', mime: 'application/pdf' },
            legal_document: { name: 'Legal Document', ext: 'pdf', mime: 'application/pdf' },
            tax_document: { name: 'Tax Document', ext: 'pdf', mime: 'application/pdf' },
            address_proof: { name: 'Proof of Address', ext: 'pdf', mime: 'application/pdf' },
            business_license: { name: 'Business License', ext: 'pdf', mime: 'application/pdf' },
            authorized_rep_id: { name: 'Identity Proof', ext: 'pdf', mime: 'application/pdf' },
            bank_document: { name: 'Bank Document', ext: 'pdf', mime: 'application/pdf' },
            finalReport: { name: 'Final Report', ext: 'pdf', mime: 'application/pdf' }
        };

        res.status(200).json({
            success: true,
            file: {
                name: fieldMap[field].name,
                ext: fieldMap[field].ext,
                mime: fieldMap[field].mime,
                base64: base64Data
            }
        });
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch file' });
    }
}

// Approve an organization document
async function approveOrganizationDocument(req, res) {
    try {
        const { orgId } = req.params;
        const { field } = req.body;
        const validFields = [
            'org_logo', 'org_brochure', 'legal_document', 'tax_document',
            'address_proof', 'business_license', 'authorized_rep_id',
            'bank_document'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        if (!organization.verificationStatus || organization.verificationStatus[field] !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Document is not in Pending status' });
        }

        organization.verificationStatus[field] = 'Verified';
        await organization.save();

        res.status(200).json(organization);
    } catch (error) {
        console.error('Error approving document:', error);
        res.status(500).json({ success: false, message: 'Failed to approve document' });
    }
}

// Disapprove an organization document
async function disapproveOrganizationDocument(req, res) {
    try {
        const { orgId } = req.params;
        const { field } = req.body;
        const validFields = [
            'org_logo', 'org_brochure', 'legal_document', 'tax_document',
            'address_proof', 'business_license', 'authorized_rep_id',
            'bank_document'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        if (!organization.verificationStatus || organization.verificationStatus[field] !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Document is not in Pending status' });
        }

        organization.verificationStatus[field] = 'Rejected';
        await organization.save();

        res.status(200).json(organization);
    } catch (error) {
        console.error('Error disapproving document:', error);
        res.status(500).json({ success: false, message: 'Failed to disapprove document' });
    }
}

// Final approval for organization
async function finalApproveOrganization(req, res) {
    try {
        const { orgId } = req.params;
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        if (!organization.verificationStatus || !organization.verificationStatus.finalReport) {
            return res.status(400).json({ success: false, message: 'Final report not uploaded' });
        }

        organization.verificationStatus.finalReport = 'Verified';
        await organization.save();

        console.log(`Final Approval Submitted: ${organization.org_name} - Final Report: Verified`);

        res.status(200).json(organization);
    } catch (error) {
        console.error('Error submitting final approval:', error);
        res.status(500).json({ success: false, message: 'Failed to submit final approval' });
    }
}

// Final disapproval for organization
async function finalDisapproveOrganization(req, res) {
    try {
        const { orgId } = req.params;
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        if (!organization.verificationStatus || !organization.verificationStatus.finalReport) {
            return res.status(400).json({ success: false, message: 'Final report not uploaded' });
        }

        organization.verificationStatus.finalReport = 'Rejected';
        await organization.save();

        console.log(`Final Disapproval Submitted: ${organization.org_name} - Final Report: Rejected`);

        res.status(200).json(organization);
    } catch (error) {
        console.error('Error submitting final disapproval:', error);
        res.status(500).json({ success: false, message: 'Failed to submit final disapproval' });
    }
}

// Upload final verification report for organization
async function uploadOrganizationFinalReport(req, res) {
    try {
        const { orgId } = req.params;
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        organization.files = organization.files || {};
        organization.files.finalReport = req.file.buffer;
        organization.verificationStatus = organization.verificationStatus || {};
        organization.verificationStatus.finalReport = 'Received';
        await organization.save();

        res.status(200).json(organization);
    } catch (error) {
        console.error('Error uploading report:', error);
        res.status(500).json({ success: false, message: 'Failed to upload verification report' });
    }
}

// Fetch current organization's details
async function getCurrentOrganization(req, res) {
    try {
        const orgId = req.session.organization.id;
        if (!mongoose.Types.ObjectId.isValid(orgId)) {
            console.error('Invalid organization ID in session:', orgId);
            return res.status(400).json({ success: false, message: 'Invalid organization ID in session' });
        }

        const organization = await Organization.findById(orgId).select('org_name email verificationStatus files');
        if (!organization) {
            console.error('Organization not found for ID:', orgId);
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        let finalReportBase64 = null;
        if (organization.files && organization.files.finalReport) {
            finalReportBase64 = organization.files.finalReport.toString('base64');
        }

        console.log(`Organization: ${organization.org_name}`);
        const fieldMap = {
            org_logo: 'Organization Logo',
            org_brochure: 'Organization Brochure',
            legal_document: 'Legal Document',
            tax_document: 'Tax Document',
            address_proof: 'Proof of Address',
            business_license: 'Business License',
            authorized_rep_id: 'Authorized Representative ID',
            bank_document: 'Bank Document',
            finalReport: 'Final Report'
        };

        const documentFields = [
            'org_logo', 'org_brochure', 'legal_document', 'tax_document',
            'address_proof', 'business_license', 'authorized_rep_id',
            'bank_document', 'finalReport'
        ];

        documentFields.forEach(field => {
            const status = organization.verificationStatus[field] || (field === 'finalReport' ? 'Not Received' : 'Not Uploaded');
            console.log(`${fieldMap[field]}: ${status}`);
        });

        res.status(200).json({
            success: true,
            organization: {
                id: organization._id,
                org_name: organization.org_name,
                email: organization.email,
                verificationStatus: {
                    org_logo: organization.verificationStatus.org_logo || 'Not Uploaded',
                    org_brochure: organization.verificationStatus.org_brochure || 'Not Uploaded',
                    legal_document: organization.verificationStatus.legal_document || 'Not Uploaded',
                    tax_document: organization.verificationStatus.tax_document || 'Not Uploaded',
                    address_proof: organization.verificationStatus.address_proof || 'Not Uploaded',
                    business_license: organization.verificationStatus.business_license || 'Not Uploaded',
                    authorized_rep_id: organization.verificationStatus.authorized_rep_id || 'Not Uploaded',
                    bank_document: organization.verificationStatus.bank_document || 'Not Uploaded',
                    finalReport: organization.verificationStatus.finalReport || 'Not Received'
                },
                finalReport: finalReportBase64 ? {
                    name: 'Final Verification Report',
                    ext: 'pdf',
                    mime: 'application/pdf',
                    base64: finalReportBase64
                } : null
            }
        });
    } catch (error) {
        console.error('Error fetching current organization:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch organization details' });
    }
}

// Check organization final report status
async function checkOrganizationStatus(req, res) {
    try {
        const organization = await Organization.findById(req.session.organization.id).select('verificationStatus');
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        const finalReportStatus = organization.verificationStatus.finalReport;

        res.status(200).json({
            success: true,
            finalReportStatus: finalReportStatus
        });
    } catch (err) {
        console.error('Error checking final report status:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
}

module.exports = {
    uploadOrganizationFiles,
    getOrganizations,
    getOrganizationFile,
    approveOrganizationDocument,
    disapproveOrganizationDocument,
    finalApproveOrganization,
    finalDisapproveOrganization,
    uploadOrganizationFinalReport,
    getCurrentOrganization,
    checkOrganizationStatus
};