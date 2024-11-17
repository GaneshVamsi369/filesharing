const File = require('../models/File');
const crypto = require('crypto');
const path = require('path');

exports.uploadFile = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "File is required" });

    try {
        const file = await File.create({
            filename: req.file.filename,
            path: req.file.path,
            uploadedBy: req.user._id,
        });
        res.status(201).json({ message: "File uploaded successfully", file });
    } catch (err) {
        res.status(500).json({ message: "Error uploading file", error: err.message });
    }
};

exports.listFiles = async (req, res) => {
    try {
        const files = await File.find({}).populate('uploadedBy', 'email');
        res.status(200).json(files);
    } catch (err) {
        res.status(500).json({ message: "Error fetching files", error: err.message });
    }
};

exports.generateDownloadLink = async (req, res) => {
    const { id } = req.params;

    try {
        const file = await File.findById(id);
        if (!file) return res.status(404).json({ message: "File not found" });

        const token = crypto.randomBytes(32).toString('hex');
        const downloadLink = `${process.env.BASE_URL}/download-file/${token}`;

        res.status(200).json({ downloadLink, message: "Success" });
    } catch (err) {
        res.status(500).json({ message: "Error generating download link", error: err.message });
    }
};

exports.downloadFile = async (req, res) => {
    const { id } = req.params;

    try {
        const file = await File.findById(id);
        if (!file) return res.status(404).json({ message: "File not found" });

        res.download(file.path, file.filename);
    } catch (err) {
        res.status(500).json({ message: "Error downloading file", error: err.message });
    }
};
