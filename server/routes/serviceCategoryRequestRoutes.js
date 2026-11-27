
const express = require("express");

const {
    createServiceCategoryRequest,
} = require("../controllers/serviceCategoryRequestController");

const router = express.Router();

router.post("/", createServiceCategoryRequest);

module.exports = router;
