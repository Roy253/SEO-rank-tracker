import KeywordTracking from "../models/KeywordTracking.js";
import { keywordTracking } from "../services/keywordTrackingService.js";

// Add keyword to tracking
export const addKeyword = async (req, res) => {
    try {
        const { keyword, url } = req.body;

        if (!keyword || !url) {
            return res.status(400).json({
                success: false,
                message: "Keyword and URL are required",
            });
        }

        // Extract domain from URL
        let domain;

        try {
            const urlObj = new URL(
                url.startsWith("http") ? url : `https://${url}`
            );

            domain = urlObj.hostname.replace("www.", "");
        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid URL",
            });
        }

        // Check if already tracking this keyword
        const existing = await KeywordTracking.findOne({
            userId: req.userId,
            keyword: keyword.toLowerCase().trim(),
            domain,
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Keyword is already being tracked for this domain",
            });
        }

        // Create tracking document
        const tracking = await KeywordTracking.create({
            userId: req.userId,
            keyword: keyword.toLowerCase().trim(),
            url: url.startsWith("http") ? url : `https://${url}`,
            domain,
            status: "checking",
        });

        // Send response immediately
        res.status(201).json({
            success: true,
            message: "Keyword tracking started",
            tracking,
        });

        // Run tracking in background
        keywordTracking(tracking).catch((err) => {
            console.error("Background tracking error:", err);
        });

    } catch (error) {
        console.error("========== ADD KEYWORD ERROR ==========");
        console.error(error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Already tracking this keyword",
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};

// Get all keywords
export const getKeywords = async (req, res) => {
    try {
        const keywords = await KeywordTracking.find({
            userId: req.userId,
        })
            .sort({ createdAt: -1 })
            .select("-rankHistory");

        res.json({
            success: true,
            keywords,
        });

    } catch (error) {
        console.error("Get keywords error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get single keyword
export const getKeyword = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOne({
            _id: req.params.id,
            userId: req.userId,
        }).select("-__v");

        if (!tracking) {
            return res.status(404).json({
                success: false,
                message: "Keyword not found",
            });
        }

        res.json({
            success: true,
            tracking,
        });

    } catch (error) {
        console.error("Get keyword error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Refresh keyword
export const refreshKeyword = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!tracking) {
            return res.status(404).json({
                success: false,
                message: "Keyword not found",
            });
        }

        tracking.status = "checking";
        await tracking.save();

        await keywordTracking(tracking);

        res.json({
            success: true,
            message: "Keyword refreshed successfully",
            tracking,
        });

    } catch (error) {
        console.error("Refresh keyword error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete keyword
export const deleteKeyword = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!tracking) {
            return res.status(404).json({
                success: false,
                message: "Keyword not found",
            });
        }

        res.json({
            success: true,
            message: "Keyword deleted successfully",
        });

    } catch (error) {
        console.error("Delete keyword error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Toggle active/inactive
export const toggleTracking = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!tracking) {
            return res.status(404).json({
                success: false,
                message: "Keyword not found",
            });
        }

        tracking.active = !tracking.active;

        await tracking.save();

        res.json({
            success: true,
            tracking,
        });

    } catch (error) {
        console.error("Toggle tracking error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};