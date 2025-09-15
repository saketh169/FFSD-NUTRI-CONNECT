const mongoose = require('mongoose');
const { Dietitian } = require('../models/userModel');

// Handle dietitian file uploads and mark as Pending
async function uploadDietitianFiles(req, res) {
    try {
        const dietitian = req.session.dietitian;
        if (!dietitian || dietitian.role !== 'dietitian') {
            return res.status(403).json({ success: false, message: 'Unauthorized: Only dietitians can upload files' });
        }

        let fileDetails = 'Uploaded Files:\n';
        const filesUpdate = {};
        const verificationStatusUpdate = {};

        const fieldMap = {
            resume: 'resume',
            degreeCertificate: 'degree_certificate',
            licenseDocument: 'license_document',
            idProof: 'id_proof',
            experienceCertificates: 'experience_certificates',
            specializationCertifications: 'specialization_certifications',
            internshipCertificate: 'internship_certificate',
            researchPapers: 'research_papers'
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
        const existingDietitian = await Dietitian.findById(dietitian.id);
        if (existingDietitian.files && existingDietitian.files.finalReport) {
            unsetFields['files.finalReport'] = '';
            console.log(`Removing existing final report for dietitian: ${dietitian.name}`);
        }

        const updatedDietitian = await Dietitian.findByIdAndUpdate(
            dietitian.id,
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

        if (!updatedDietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        req.session.dietitian = {
            id: updatedDietitian._id,
            role: 'dietitian',
            email: updatedDietitian.email,
            name: updatedDietitian.name
        };

        res.status(200).json({
            success: true,
            message: 'Files uploaded and marked as Pending successfully!',
            files: req.files,
            dietitian: {
                id: updatedDietitian._id,
                email: updatedDietitian.email,
                name: updatedDietitian.name,
                verificationStatus: updatedDietitian.verificationStatus
            }
        });
    } catch (err) {
        console.error('Error uploading files:', err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
}

// Fetch all dietitians and log file statuses
async function getDietitians(req, res) {
    try {
        const dietitians = await Dietitian.find().select('name email files verificationStatus');

        console.log('Dietitians with Verified Files:');
        dietitians.forEach((dietitian) => {
            const verifiedFiles = Object.keys(dietitian.verificationStatus || {})
                .filter((key) => dietitian.verificationStatus[key] === 'Verified')
                .map((key) => {
                    const fieldMap = {
                        resume: 'Resume',
                        degree_certificate: 'Degree Certificate',
                        license_document: 'License Document',
                        id_proof: 'ID Proof',
                        experience_certificates: 'Experience Certificates',
                        specialization_certifications: 'Specialization Certifications',
                        internship_certificate: 'Internship Certificate',
                        research_papers: 'Research Papers',
                        finalReport: 'Final Report'
                    };
                    return fieldMap[key] || key;
                });
            if (verifiedFiles.length > 0) {
                console.log(`- ${dietitian.name}: ${verifiedFiles.join(', ')}`);
            }
        });

        console.log('\nDietitians with Rejected Files:');
        dietitians.forEach((dietitian) => {
            const rejectedFiles = Object.keys(dietitian.verificationStatus || {})
                .filter((key) => dietitian.verificationStatus[key] === 'Rejected')
                .map((key) => {
                    const fieldMap = {
                        resume: 'Resume', // Fixed typo from 'Degree Certificate'
                        degree_certificate: 'Degree Certificate',
                        license_document: 'License Document',
                        id_proof: 'ID Proof',
                        experience_certificates: 'Experience Certificates',
                        specialization_certifications: 'Specialization Certifications',
                        internship_certificate: 'Internship Certificate',
                        research_papers: 'Research Papers',
                        finalReport: 'Final Report'
                    };
                    return fieldMap[key] || key;
                });
            if (rejectedFiles.length > 0) {
                console.log(`- ${dietitian.name}: ${rejectedFiles.join(', ')}`);
            }
        });

        res.status(200).json(dietitians);
    } catch (error) {
        console.error('Error fetching dietitians:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dietitians' });
    }
}

// Fetch a dietitian file as base64
async function getDietitianFile(req, res) {
    try {
        const { dietitianId, field } = req.params;
        const validFields = [
            'resume', 'degree_certificate', 'license_document', 'id_proof',
            'experience_certificates', 'specialization_certifications',
            'internship_certificate', 'research_papers', 'finalReport'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        const files = dietitian.files || {};
        const fileBuffer = files[field];
        if (!fileBuffer || fileBuffer.length === 0) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        const base64Data = fileBuffer.toString('base64');
        const fieldMap = {
            resume: { name: 'Resume', ext: 'pdf', mime: 'application/pdf' },
            degree_certificate: { name: 'Degree Certificate', ext: 'pdf', mime: 'application/pdf' },
            license_document: { name: 'License Document', ext: 'pdf', mime: 'application/pdf' },
            id_proof: { name: 'ID Proof', ext: 'pdf', mime: 'application/pdf' },
            experience_certificates: { name: 'Experience Certificates', ext: 'pdf', mime: 'application/pdf' },
            specialization_certifications: { name: 'Specialization Certifications', ext: 'pdf', mime: 'application/pdf' },
            internship_certificate: { name: 'Internship Certificate', ext: 'pdf', mime: 'application/pdf' },
            research_papers: { name: 'Research Papers', ext: 'pdf', mime: 'application/pdf' },
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

// Approve a dietitian document
async function approveDietitianDocument(req, res) {
    try {
        const { dietitianId } = req.params;
        const { field } = req.body;
        const validFields = [
            'resume', 'degree_certificate', 'license_document', 'id_proof',
            'experience_certificates', 'specialization_certifications',
            'internship_certificate', 'research_papers'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        if (!dietitian.verificationStatus || dietitian.verificationStatus[field] !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Document is not in Pending status' });
        }

        dietitian.verificationStatus[field] = 'Verified';
        await dietitian.save();

        res.status(200).json(dietitian);
    } catch (error) {
        console.error('Error approving document:', error);
        res.status(500).json({ success: false, message: 'Failed to approve document' });
    }
}

// Disapprove a dietitian document
async function disapproveDietitianDocument(req, res) {
    try {
        const { dietitianId } = req.params;
        const { field } = req.body;
        const validFields = [
            'resume', 'degree_certificate', 'license_document', 'id_proof',
            'experience_certificates', 'specialization_certifications',
            'internship_certificate', 'research_papers'
        ];
        if (!validFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid file field' });
        }

        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        if (!dietitian.verificationStatus || dietitian.verificationStatus[field] !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Document is not in Pending status' });
        }

        dietitian.verificationStatus[field] = 'Rejected';
        await dietitian.save();

        res.status(200).json(dietitian);
    } catch (error) {
        console.error('Error disapproving document:', error);
        res.status(500).json({ success: false, message: 'Failed to disapprove document' });
    }
}

// Final approval for dietitian
async function finalApproveDietitian(req, res) {
    try {
        const { dietitianId } = req.params;
        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        if (!dietitian.verificationStatus || !dietitian.verificationStatus.finalReport) {
            return res.status(400).json({ success: false, message: 'Final report not uploaded' });
        }

        dietitian.verificationStatus.finalReport = 'Verified';
        await dietitian.save();

        console.log(`Final Approval Submitted: ${dietitian.name} - Final Report: Verified`);

        res.status(200).json(dietitian);
    } catch (error) {
        console.error('Error submitting final approval:', error);
        res.status(500).json({ success: false, message: 'Failed to submit final approval' });
    }
}

// Final disapproval for dietitian
async function finalDisapproveDietitian(req, res) {
    try {
        const { dietitianId } = req.params;
        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        if (!dietitian.verificationStatus || !dietitian.verificationStatus.finalReport) {
            return res.status(400).json({ success: false, message: 'Final report not uploaded' });
        }

        dietitian.verificationStatus.finalReport = 'Rejected';
        await dietitian.save();

        console.log(`Final Disapproval Submitted: ${dietitian.name} - Final Report: Rejected`);

        res.status(200).json(dietitian);
    } catch (error) {
        console.error('Error submitting final disapproval:', error);
        res.status(500).json({ success: false, message: 'Failed to submit final disapproval' });
    }
}

// Upload final verification report for dietitian
async function uploadDietitianFinalReport(req, res) {
    try {
        const { dietitianId } = req.params;
        const dietitian = await Dietitian.findById(dietitianId);
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        dietitian.files = dietitian.files || {};
        dietitian.files.finalReport = req.file.buffer;
        dietitian.verificationStatus = dietitian.verificationStatus || {};
        dietitian.verificationStatus.finalReport = 'Received';
        await dietitian.save();

        res.status(200).json(dietitian);
    } catch (error) {
        console.error('Error uploading report:', error);
        res.status(500).json({ success: false, message: 'Failed to upload verification report' });
    }
}

// Fetch current dietitian's details
async function getCurrentDietitian(req, res) {
    try {
        const dietitianId = req.session.dietitian.id;
        if (!mongoose.Types.ObjectId.isValid(dietitianId)) {
            return res.status(400).json({ success: false, message: 'Invalid dietitian ID in session' });
        }

        const dietitian = await Dietitian.findById(dietitianId).select('name email verificationStatus files');
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        let finalReportBase64 = null;
        if (dietitian.files && dietitian.files.finalReport) {
            finalReportBase64 = dietitian.files.finalReport.toString('base64');
        }

        console.log(`Dietitian: ${dietitian.name}`);
        const fieldMap = {
            resume: 'Resume',
            degree_certificate: 'Degree Certificate',
            license_document: 'License Document',
            id_proof: 'ID Proof',
            experience_certificates: 'Experience Certificates',
            specialization_certifications: 'Specialization Certifications',
            internship_certificate: 'Internship Certificate',
            research_papers: 'Research Papers',
            finalReport: 'Final Report'
        };

        const documentFields = [
            'resume', 'degree_certificate', 'license_document', 'id_proof',
            'experience_certificates', 'specialization_certifications',
            'internship_certificate', 'research_papers', 'finalReport'
        ];

        documentFields.forEach(field => {
            const status = dietitian.verificationStatus[field] || (field === 'finalReport' ? 'Not Received' : 'Not Uploaded');
            console.log(`${fieldMap[field]}: ${status}`);
        });

        res.status(200).json({
            success: true,
            dietitian: {
                id: dietitian._id,
                name: dietitian.name,
                email: dietitian.email,
                verificationStatus: dietitian.verificationStatus,
                finalReport: finalReportBase64 ? {
                    name: 'Final Verification Report',
                    ext: 'pdf',
                    mime: 'application/pdf',
                    base64: finalReportBase64
                } : null
            }
        });
    } catch (error) {
        console.error('Error fetching current dietitian:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dietitian details' });
    }
}

// Check dietitian final report status
async function checkDietitianStatus(req, res) {
    try {
        const dietitian = await Dietitian.findById(req.session.dietitian.id).select('verificationStatus');
        if (!dietitian) {
            return res.status(404).json({ success: false, message: 'Dietitian not found' });
        }

        const finalReportStatus = dietitian.verificationStatus.finalReport;

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
    uploadDietitianFiles,
    getDietitians,
    getDietitianFile,
    approveDietitianDocument,
    disapproveDietitianDocument,
    finalApproveDietitian,
    finalDisapproveDietitian,
    uploadDietitianFinalReport,
    getCurrentDietitian,
    checkDietitianStatus
};