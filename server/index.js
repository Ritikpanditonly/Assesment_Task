require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDatabase = require("./config/db");

const serviceCategoryRequestRoutes = require(
    "./routes/serviceCategoryRequestRoutes"
);

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Peaks Tourism API is running.",
    });
});

app.use(
    "/api/service-category-requests",
    serviceCategoryRequestRoutes
);

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found.",
    });
});

app.use((error, req, res, next) => {
    console.error(error);

    if (
        error instanceof SyntaxError &&
        error.status === 400 &&
        "body" in error
    ) {
        return res.status(400).json({
            message: "Invalid JSON in request body.",
        });
    }

    return res.status(500).json({
        message: "Something went wrong on the server.",
    });
});

const startServer = async () => {
    try {
        await connectDatabase();

        const port = process.env.PORT || 5000;

        app.listen(port, () => {
            console.log(
                `Server is running on http://localhost:${port}`
            );
        });
    } catch (error) {
        console.error(
            "Could not start the server:",
            error.message
        );

        process.exit(1);
    }
};

startServer();
