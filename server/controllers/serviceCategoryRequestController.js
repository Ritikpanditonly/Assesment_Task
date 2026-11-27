
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const ServiceCategoryRequest = require("../models/ServiceCategoryRequest");

const dataFile = path.join(__dirname, "..", "requests.json");

// Fallback used when MongoDB is not connected
const saveToFile = async (values) => {
    let saved = [];

    try {
        saved = JSON.parse(await fs.readFile(dataFile, "utf8"));
    } catch {
        saved = [];
    }

    const record = {
        _id: crypto.randomUUID(),
        ...values,
        createdAt: new Date().toISOString(),
    };

    saved.push(record);
    await fs.writeFile(dataFile, JSON.stringify(saved, null, 2));

    return record;
};

const checkRequest = (data) => {
    const errors = {};

    const categoryName = String(data.categoryName || "").trim();
    const categoryDescription = String(
        data.categoryDescription || ""
    ).trim();
    const reason = String(data.reason || "").trim();
    const parentCategory = String(
        data.parentCategory || ""
    ).trim();
    const exampleServices = String(
        data.exampleServices || ""
    ).trim();
    const operatingLocation = String(
        data.operatingLocation || ""
    ).trim();
    const contactEmail = String(
        data.contactEmail || ""
    ).trim();
    const referenceUrl = String(
        data.referenceUrl || ""
    ).trim();

    if (!categoryName) {
        errors.categoryName = "Category name is required.";
    } else if (
        categoryName.length < 3 ||
        categoryName.length > 80
    ) {
        errors.categoryName =
            "Category name must be between 3 and 80 characters.";
    }

    if (!categoryDescription) {
        errors.categoryDescription =
            "Category description is required.";
    } else if (
        categoryDescription.length < 20 ||
        categoryDescription.length > 500
    ) {
        errors.categoryDescription =
            "Description must be between 20 and 500 characters.";
    }

    if (!reason) {
        errors.reason = "Reason is required.";
    } else if (
        reason.length < 20 ||
        reason.length > 500
    ) {
        errors.reason =
            "Reason must be between 20 and 500 characters.";
    }

    const parentCategories = [
        "Adventure",
        "Transport",
        "Accommodation",
    ];

    if (
        parentCategory &&
        !parentCategories.includes(parentCategory)
    ) {
        errors.parentCategory =
            "Please select a valid parent category.";
    }

    if (!exampleServices) {
        errors.exampleServices =
            "At least one example service is required.";
    }

    if (!operatingLocation) {
        errors.operatingLocation =
            "Operating location is required.";
    }

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!contactEmail) {
        errors.contactEmail = "Email is required.";
    } else if (!emailPattern.test(contactEmail)) {
        errors.contactEmail =
            "Please enter a valid email address.";
    }

    if (referenceUrl) {
        try {
            const url = new URL(referenceUrl);

            if (
                url.protocol !== "http:" &&
                url.protocol !== "https:"
            ) {
                errors.referenceUrl =
                    "Please enter an HTTP or HTTPS URL.";
            }
        } catch {
            errors.referenceUrl =
                "Please enter a valid URL.";
        }
    }

    return {
        errors,
        values: {
            categoryName,
            categoryDescription,
            reason,
            parentCategory,
            exampleServices,
            operatingLocation,
            contactEmail: contactEmail.toLowerCase(),
            referenceUrl,
        },
    };
};

const createServiceCategoryRequest = async (
    req,
    res,
    next
) => {
    try {
        const { errors, values } = checkRequest(
            req.body || {}
        );

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                message: "Please correct the form errors.",
                errors,
            });
        }

        const savedRequest =
            mongoose.connection.readyState === 1
                ? await ServiceCategoryRequest.create(values)
                : await saveToFile(values);

        return res.status(201).json({
            message: "Category request submitted successfully!",
            requestId: savedRequest._id,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createServiceCategoryRequest,
};
