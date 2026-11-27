
const mongoose = require("mongoose");

const serviceCategoryRequestSchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 80,
        },

        categoryDescription: {
            type: String,
            required: true,
            trim: true,
            minlength: 20,
            maxlength: 500,
        },

        reason: {
            type: String,
            required: true,
            trim: true,
            minlength: 20,
            maxlength: 500,
        },

        parentCategory: {
            type: String,
            enum: ["", "Adventure", "Transport", "Accommodation"],
            default: "",
        },

        exampleServices: {
            type: String,
            required: true,
            trim: true,
        },

        operatingLocation: {
            type: String,
            required: true,
            trim: true,
        },

        contactEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        referenceUrl: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "ServiceCategoryRequest",
    serviceCategoryRequestSchema
);
