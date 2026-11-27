# Service Category Request

 Overview

This feature allows partners to request a new service category if they cannot find a suitable option in the existing categories.

The frontend is built using React (Vite) and Tailwind CSS, while the backend uses Node.js, Express, and MongoDB. When a partner submits the form, the backend validates the information and saves the request.

Project Structure

- `Client/` – React frontend application.
- `server/` – Express backend and API.

 How to Run the Project

Make sure Node.js 18 or above is installed and MongoDB is running locally.

### 1. Start the Backend

Open a terminal and run:

```bash
cd server
npm install
npm run dev
```

The backend runs at `http://localhost:5000`.

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/peaks_tourism
CLIENT_URL=http://localhost:3000
```

If MongoDB is unavailable, the application can still accept requests and store them in `server/requests.json`.

### 2. Start the Frontend

Open another terminal:

```bash
cd Client
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

The Vite configuration forwards API requests to the backend running on port 5000, so the frontend can communicate with the backend without additional browser CORS configuration.

## How the Feature Works

The request follows this flow:

1. The partner opens the Service Category Request form in `RequestCategory.jsx`.
2. They fill in the required details and submit the form.
3. The frontend checks the entered information and sends a POST request to `/api/service-category-requests`.
4. Vite forwards the request to the Express backend.
5. The backend validates the information again before saving it.
6. The request is stored in MongoDB. If MongoDB is unavailable, it is saved in a local JSON file.
7. The frontend displays a success message or highlights the fields that need correction.

The main files involved are:

- `Client/src/Pages/RequestCategory.jsx`
- `Client/vite.config.js`
- `server/index.js`
- `server/routes/serviceCategoryRequestRoutes.js`
- `server/controllers/serviceCategoryRequestController.js`
- `server/models/ServiceCategoryRequest.js`

## API Documentation

**Create a Service Category Request**

| Detail | Value |
|---|---|
| Method | POST |
| Endpoint | `/api/service-category-requests` |
| Local API URL | `http://localhost:5000/api/service-category-requests` |
| Content-Type | `application/json` |
| Authentication | Not required |

### Form Fields

| Field | Required | Validation |
|---|---|---|
| categoryName | Yes | 3–80 characters |
| categoryDescription | Yes | 20–500 characters |
| reason | Yes | 20–500 characters |
| parentCategory | No | Adventure, Transport, Accommodation, or empty |
| exampleServices | Yes | At least one example service |
| operatingLocation | Yes | City or region |
| contactEmail | Yes | Valid email address |
| referenceUrl | No | Must be a valid HTTP or HTTPS URL if provided |

All text fields are trimmed before validation. Email addresses are stored in lowercase.

### Sample Request

```json
{
  "categoryName": "Trekking",
  "categoryDescription": "Guided mountain treks for tourists and groups",
  "reason": "Many customers keep asking for this service",
  "parentCategory": "Adventure",
  "exampleServices": "Himalaya trek, day hike",
  "operatingLocation": "Manali",
  "contactEmail": "test@example.com",
  "referenceUrl": "https://example.com"
}
```

## API Responses

### Successful Request – 201 Created

```json
{
  "message": "Category request submitted successfully!",
  "requestId": "6745f0c2a1b2c3d4e5f67890"
}
```

The response includes a confirmation message and the ID of the saved request.

 Validation Error – 400 Bad Request

```json
{
  "message": "Please correct the form errors.",
  "errors": {
    "categoryName": "Category name is required.",
    "contactEmail": "Please enter a valid email address.",
    "referenceUrl": "Please enter an HTTP or HTTPS URL."
  }
}
```

If the submitted information is invalid, the API returns field-level error messages.

Malformed JSON also returns a 400 response. Unexpected server errors return 500.

## Testing

The API was tested using curl and Postman, and the frontend was tested through the Vite development server.

| Test Case | Result |
|---|---|
| Submit a valid request directly to the API | Passed – 201 response |
| Submit a valid request through the frontend proxy | Passed – 201 response |
| Submit empty or invalid fields | Passed – 400 response with validation errors |
| Submit an invalid request directly to the API | Passed – 400 response |
| Submit malformed JSON | Passed – 400 response |
| Rapidly click Submit multiple times | Pending manual browser verification |
| Submit while the backend is stopped | Pending manual browser verification |

The form also prevents repeated submissions while a request is being processed by disabling the Submit button and using a `useRef` flag.

If the backend cannot be reached, the frontend is designed to display a clear error message.

## Issue Identified and Fixed

During testing, the Submit button was not working as expected. When checking the browser's Network tab, the API request was failing.

After checking the configuration, I found that the frontend was sending requests to the Vite development server instead of the Express backend.

There were also two configuration issues:

- The Vite proxy was not configured correctly.
- The database name in the `.env` file contained an unwanted space, and the frontend URL variable name did not match what the server was reading.

To fix these issues, I configured the `/api` proxy in `vite.config.js`, corrected the environment variables, and added a JSON file fallback for cases where MongoDB is unavailable.

I also moved the submission status message next to the Submit button so that users can easily see whether their request was successful or failed.

After making these changes, I tested both valid and invalid requests. The API returned the expected 201 and 400 responses.

## Remaining Work

A couple of scenarios still need to be checked manually in the browser:

1. Click the Submit button rapidly multiple times and confirm that only one request is saved.
2. Stop the backend and try submitting the form to confirm that the user sees the correct error message.

These checks can be completed using the browser's Network tab and by checking `server/requests.json`.

There are currently no automated tests. The API functionality has been verified using curl and Postman.
