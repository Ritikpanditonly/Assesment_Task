#– Service Category Request

A small  feature where a  partner can request a new service category.
React (Vite + Tailwind) on the front Express + MongoDB on the back.

## Project layout
Client/   React app (Vite)
server/   Express API

## How to run it

You need Node.js 18+ and  MongoDB running locally.

1. Backend

cd server
npm install
npm run dev

The API starts on http://localhost:5000. The settings live in `server/.env`:

PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/peaks_tourism
CLIENT_URL=http://localhost:3000

If MongoDB is not running (or `MONGODB_URI` is empty) the server still starts and saves
requests to `server/requests.json` instead.

2. Frontend** (in a second terminal)

cd Client
npm install
npm run dev

Open http://localhost:3000. Vite forwards every `/api/...` call to the backend on port 5000
(see `Client/vite.config.js`), so there is no CORS fiddling in the browser.

## How a request travels

1. The form lives in `Client/src/Pages/RequestCategory.jsx` (rendered by `App.jsx`). It trims and
 validates the fields, then sends a `POST /api/service-category-requests` with `fetch`.
2. Vite's dev proxy (`Client/vite.config.js`) passes that call to Express in `server/index.js`.
3. `server/routes/serviceCategoryRequestRoutes.js` hands it to
  `server/controllers/serviceCategoryRequestController.js`, which trims and validates everything
  again on the server.
4. A valid request is saved through `server/models/ServiceCategoryRequest.js` (MongoDB), or to
  `server/requests.json` when there is no database. The API replies `201` with a request ID
  invalid one gets `400` with an `errors` object.
5. The page shows the result next to the Submit button: a green success message, red field  errors, or a clear "could not reach the server" message.

## API documentation

### Create a service category request


 Method | `POST` |
 Path | `/api/service-category-requests` |
Base URL (local) | `http://localhost:5000` |
 Headers | `Content-Type: application/json` |
 Authentication | None |

### Fields

| Field | Type | Required | Rules |
| `categoryName` | string | Yes | Trimmed, 3–80 characters |
| `categoryDescription` | string | Yes | Trimmed, 20–500 characters |
| `reason` | string | Yes | Why the category is needed. Trimmed, 20–500 characters |
| `parentCategory` | string | No | One of `Adventure`, `Transport`, `Accommodation`, or empty |
| `exampleServices` | string | Yes | At least one example service |
| `operatingLocation` | string | Yes | City or region |
| `contactEmail` | string | Yes | Valid email format (saved in lower case) |
| `referenceUrl` | string | No | If given, must be a valid `http://` or `https://` URL |

All text is trimmed before checking, so whitespace-only values count as empty.

### Sample request

`json
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

### Responses
*201 Created*

json
{
  "message": "Category request submitted successfully!",
  "requestId": "6745f0c2a1b2c3d4e5f67890"
}


**400 Bad Request** (field-level errors)

json
{
  "message": "Please correct the form errors.",
  "errors": {
    "categoryName": "Category name is required.",
    "contactEmail": "Please enter a valid email address.",
    "referenceUrl": "Please enter an HTTP or HTTPS URL."
  }
}


Malformed JSON also returns `400` (`{"message": "Invalid JSON in request body."}`), and an
unexpected server problem returns `500`.

### curl

Valid request:

curl -i -X POST http://localhost:5000/api/service-category-requests \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"Trekking","categoryDescription":"Guided mountain treks for tourists and groups","reason":"Many customers keep asking for this service","parentCategory":"Adventure","exampleServices":"Himalaya trek, day hike","operatingLocation":"Manali","contactEmail":"test@example.com","referenceUrl":"https://example.com"}'

Invalid request:

curl -i -X POST http://localhost:5000/api/service-category-requests \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"   ","contactEmail":"bad-email","referenceUrl":"ftp://example.com"}'

In Postman: set method to POST, use the URL above, choose Body → raw → JSON, and paste the sample.

## Test log

| Test | Expected | Actual |
| Valid request sent to the API | 201 + request ID, one record saved | 201, ID returned, one record saved |
| Valid request through the Vite proxy (port 3000) | 201 | 201 |
| Blank / whitespace-only name, bad email, `ftp://` URL | 400 with field errors, nothing saved | 400 with errors for every bad field, nothing saved |
| Invalid request sent straight to the API | 400 | 400 |
| Broken JSON body | 400 | 400 "Invalid JSON in request body." |
| Rapid double-click on Submit | One record only | Needs a browser check (see below) |
| Backend stopped, then Submit | Clear error on the page | Needs a browser check (see below) |

How the last two are meant to work: the form blocks a second submit while one is running
(a `useRef` flag plus a disabled button), so a double-click sends one request. If the server is
down the page shows "Could not reach the server…". Please confirm both in the browser and check
the Network tab / `server/requests.json` for a single record.

## Issue found and fixed

Problem:Clicking Submit did nothing useful; the browser Network tab showed the
`/api/service-category-requests` call failing.

Cause: The page calls a relative URL (`/api/...`), but Vite had no proxy configured, so the
request went to the Vite dev server (which has no API) instead of Express on port 5000.
Related config slips made it worse: `.env` had a database name with a space in it, and the
server read `FRONTEND_URL` while `.env` defined `CLIENT_URL`.

Fix: Added the `/api` proxy in `Client/vite.config.js`, cleaned up `.env`, and made the
server fall back to a local file when MongoDB is unavailable. The submit result message was
also moved next to the button so it can't be missed on long forms.

Retest: After the fix a valid submission returns 201 and an invalid one returns 400, both
directly and through the proxy.


## Known gaps

The double-click and "API unavailable" cases still need a manual browser run-through.
 No automated tests; the API was checked with curl/Postman.
