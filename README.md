# My Mess API

## Project Description

My Mess API is a backend server built with Node.js, TypeScript, and Express, designed to manage mess (cafeteria) operations including user authentication, mess management, and meal scheduling. It uses MongoDB for data storage and includes features such as input validation, sanitization, logging, security middleware, and scheduled cron jobs for automated meal creation.

## Features Overview

- User authentication and role-based access control
- Mess management: create, update, join, approve users
- Meal management: create, update, toggle meals for date ranges, bulk creation for one month
- Input validation and sanitization using Zod and custom middlewares
- Security enhancements with Helmet, CORS, and rate limiting
- Logging with Morgan and Winston
- Graceful shutdown and error handling
- Scheduled cron jobs for automated meal creation

## Technologies Used

- Node.js
- TypeScript
- Express.js
- MongoDB with Mongoose
- Zod for schema validation
- Helmet for security headers
- CORS for cross-origin resource sharing
- Morgan and Winston for logging
- Node-cron for scheduled tasks
- Bcryptjs for password hashing
- JSON Web Tokens for authentication

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd server
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Create a `.env` file in the root directory and configure environment variables (see Configuration section).

## Configuration

The application uses environment variables for configuration. Create a `.env` file with the following variables:

```env
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=1d
EMAIL_HOST=<smtp-host>
EMAIL_PORT=<smtp-port>
EMAIL_USER=<smtp-user>
EMAIL_PASS=<smtp-password>
```

Adjust the values according to your environment.

## Running the Server

### Development Mode

Runs the server with automatic reload on code changes:

```bash
yarn dev
```

### Production Mode

Build the TypeScript code and start the server:

```bash
yarn build
yarn start
```

## API Endpoints Overview

All API endpoints are prefixed with `/api/v1`.

### Authentication and User Management (`/api/v1/auth`)

- `POST /signup` - Register a new user
- `POST /signin` - User login
- `POST /verify-otp` - Verify OTP for authentication
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- Protected routes for user CRUD operations, password update, activity logs, restricted by roles

### Mess Management (`/api/v1/mess`)

- `POST /` - Create a new mess (Admin, Manager only)
- `GET /` - List messes
- `GET /:messId` - Get mess details
- `POST /join-mess` - Request to join a mess
- `POST /:userId/approve-mess` - Approve user to join mess (Admin, Manager only)
- `PATCH /:messId` - Update mess (Admin, Manager only)
- `DELETE /:messId` - Delete mess (Admin only)
- `GET /unapproved-users` - List users pending approval (Admin, Manager only)

### Meal Management (`/api/v1/meal`)

- `POST /` - Create a meal
- `GET /` - List meals
- `GET /:mealId` - Get meal details
- `POST /toggle` - Toggle meals for a date range
- `GET /create-for-one-month` - Create meals for one month
- `PATCH /:mealId` - Update meal
- `DELETE /:mealId` - Delete meal (Admin, Manager only)

## Middleware and Security

- Input validation using Zod schemas
- Input sanitization middleware to prevent injection attacks
- Helmet for setting secure HTTP headers
- CORS enabled for cross-origin requests
- Rate limiting on GET requests to prevent abuse
- Authentication and role-based access control middleware

## Logging

- HTTP request logging with Morgan integrated with Winston
- Application logs managed by Winston with daily rotation
- Logs stored in the `logs/` directory

## Cron Jobs

- Scheduled cron job for automated meal creation runs periodically (configured in `src/app/corn/meal.corn.ts`)

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the ISC License.
