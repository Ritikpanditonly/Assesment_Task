import React, { useEffect, useRef, useState } from "react";

const RequestCategory = () => {
    const [formData, setFormData] = useState({
        categoryName: "",
        categoryDescription: "",
        reason: "",
        parentCategory: "",
        exampleServices: "",
        operatingLocation: "",
        contactEmail: "",
        referenceUrl: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const requestInProgress = useRef(false);
    const statusRef = useRef(null);

    useEffect(() => {
        if (message || errors.submit) {
            statusRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [message, errors.submit]);

    const parentCategories = [
        "Adventure",
        "Transport",
        "Accommodation",
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

        setErrors({
            ...errors,
            [name]: "",
            submit: "",
        });

        setMessage("");
    };

    const validateForm = () => {
        const newErrors = {};

        const categoryName = formData.categoryName.trim();
        const categoryDescription =
            formData.categoryDescription.trim();
        const reason = formData.reason.trim();
        const exampleServices = formData.exampleServices.trim();
        const operatingLocation =
            formData.operatingLocation.trim();
        const contactEmail = formData.contactEmail.trim();
        const referenceUrl = formData.referenceUrl.trim();

        if (!categoryName) {
            newErrors.categoryName = "Category name is required.";
        } else if (
            categoryName.length < 3 ||
            categoryName.length > 80
        ) {
            newErrors.categoryName =
                "Category name must be between 3 and 80 characters.";
        }

        if (!categoryDescription) {
            newErrors.categoryDescription =
                "Category description is required.";
        } else if (
            categoryDescription.length < 20 ||
            categoryDescription.length > 500
        ) {
            newErrors.categoryDescription =
                "Description must be between 20 and 500 characters.";
        }

        if (!reason) {
            newErrors.reason =
                "Please explain why you need this category.";
        } else if (reason.length < 20 || reason.length > 500) {
            newErrors.reason =
                "Reason must be between 20 and 500 characters.";
        }

        if (!exampleServices) {
            newErrors.exampleServices =
                "Please enter at least one example service.";
        }

        if (!operatingLocation) {
            newErrors.operatingLocation =
                "Operating location is required.";
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!contactEmail) {
            newErrors.contactEmail = "Email is required.";
        } else if (!emailPattern.test(contactEmail)) {
            newErrors.contactEmail =
                "Please enter a valid email address.";
        }

        if (referenceUrl) {
            try {
                const url = new URL(referenceUrl);

                if (
                    url.protocol !== "http:" &&
                    url.protocol !== "https:"
                ) {
                    newErrors.referenceUrl =
                        "Please enter an HTTP or HTTPS URL.";
                }
            } catch {
                newErrors.referenceUrl =
                    "Please enter a valid URL.";
            }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (requestInProgress.current) {
            return;
        }

        setMessage("");

        if (!validateForm()) {
            return;
        }

        requestInProgress.current = true;
        setLoading(true);

        try {
            const response = await fetch(
                "/api/service-category-requests",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        categoryName: formData.categoryName.trim(),
                        categoryDescription:
                            formData.categoryDescription.trim(),
                        reason: formData.reason.trim(),
                        parentCategory: formData.parentCategory,
                        exampleServices:
                            formData.exampleServices.trim(),
                        operatingLocation:
                            formData.operatingLocation.trim(),
                        contactEmail: formData.contactEmail.trim(),
                        referenceUrl: formData.referenceUrl.trim(),
                    }),
                }
            );

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (result.errors) {
                    setErrors(result.errors);
                }

                throw new Error(
                    result.message || "Unable to submit the request."
                );
            }

            setMessage(
                result.message || "Request submitted successfully."
            );

            setFormData({
                categoryName: "",
                categoryDescription: "",
                reason: "",
                parentCategory: "",
                exampleServices: "",
                operatingLocation: "",
                contactEmail: "",
                referenceUrl: "",
            });

            setErrors({});
        } catch (error) {
            const serverDown =
                error instanceof TypeError ||
                error.message === "Unable to submit the request.";

            setErrors((previousErrors) => ({
                ...previousErrors,
                submit: serverDown
                    ? "Could not reach the server. Please make sure the backend is running and try again."
                    : error.message,
            }));
        } finally {
            requestInProgress.current = false;
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-md border border-black bg-white px-3 py-2 text-black placeholder:text-black/50 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50";

    const labelClass =
        "mb-1 block text-sm font-medium text-black";

    const showError = (field) => {
        if (!errors[field]) {
            return null;
        }

        return (
            <p className="mt-1 text-sm text-black">
                {errors[field]}
            </p>
        );
    };

    return (
        <div className="min-h-screen bg-white px-4 py-8 text-black">
            <div className="mx-auto max-w-2xl border border-black bg-white p-6 sm:p-8">

                <h1 className="text-2xl font-semibold">
                    Request a New Category
                </h1>

                <p className="mt-2 text-sm">
                    Enter the details to request a new service category.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-5"
                    noValidate
                >
                    <div>
                        <label className={labelClass}>
                            Category Name *
                        </label>

                        <input
                            type="text"
                            name="categoryName"
                            value={formData.categoryName}
                            onChange={handleChange}
                            placeholder="Enter category name"
                            maxLength={80}
                            className={inputClass}
                            disabled={loading}
                        />

                        {showError("categoryName")}
                    </div>

                    <div>
                        <label className={labelClass}>
                            Category Description *
                        </label>

                        <textarea
                            name="categoryDescription"
                            value={formData.categoryDescription}
                            onChange={handleChange}
                            placeholder="Describe the category"
                            rows={4}
                            maxLength={500}
                            className={inputClass}
                            disabled={loading}
                        />

                        <p className="mt-1 text-sm">
                            {formData.categoryDescription.length}/500
                        </p>

                        {showError("categoryDescription")}
                    </div>

                    <div>
                        <label className={labelClass}>
                            Why do you need this category? *
                        </label>

                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            placeholder="Explain why this category is needed"
                            rows={4}
                            maxLength={500}
                            className={inputClass}
                            disabled={loading}
                        />

                        {showError("reason")}
                    </div>

                    <div>
                        <label className={labelClass}>
                            Parent Category
                        </label>

                        <select
                            name="parentCategory"
                            value={formData.parentCategory}
                            onChange={handleChange}
                            className={inputClass}
                            disabled={loading}
                        >
                            <option value="">
                                Select parent category
                            </option>

                            {parentCategories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>
                            Example Services *
                        </label>

                        <textarea
                            name="exampleServices"
                            value={formData.exampleServices}
                            onChange={handleChange}
                            placeholder="Enter example services"
                            rows={3}
                            className={inputClass}
                            disabled={loading}
                        />

                        {showError("exampleServices")}
                    </div>

                    <div>
                        <label className={labelClass}>
                            Operating Location *
                        </label>

                        <input
                            type="text"
                            name="operatingLocation"
                            value={formData.operatingLocation}
                            onChange={handleChange}
                            placeholder="Enter city or region"
                            className={inputClass}
                            disabled={loading}
                        />

                        {showError("operatingLocation")}
                    </div>

                    <div>
                        <label className={labelClass}>
                            Contact Email *
                        </label>

                        <input
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            className={inputClass}
                            disabled={loading}
                        />

                        {showError("contactEmail")}
                    </div>

                    <div>
                        <label className={labelClass}>
                            Reference URL
                        </label>

                        <input
                            type="url"
                            name="referenceUrl"
                            value={formData.referenceUrl}
                            onChange={handleChange}
                            placeholder="https://example.com"
                            className={inputClass}
                            disabled={loading}
                        />

                        {showError("referenceUrl")}
                    </div>

                    <div ref={statusRef} aria-live="polite">
                        {message && (
                            <p className="border border-green-700 bg-green-50 p-3 text-sm text-green-800">
                                {message}
                            </p>
                        )}

                        {errors.submit && (
                            <p className="border border-red-700 bg-red-50 p-3 text-sm text-red-800">
                                {errors.submit}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full border border-black bg-white px-4 py-3 text-sm font-medium text-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Submitting..." : "Submit Request"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RequestCategory;