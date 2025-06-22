# Library Management System API

A RESTful API for managing a library’s resources—books, authors, users, loans, and reviews—built with Node.js, Express, and MongoDB. It includes authentication, validation, file uploads (e.g., cover images, profile pictures), and error handling.

## Features
- **Books Module**: CRUD operations, pagination, filtering (tags, categories, price range, languages, title search), sorting.
- **Authors Module**: CRUD operations, pagination, filtering by genres.
- **Users Module**: Registration, login (JWT), profile management, profile picture upload, role assignment, admin-only user listing/updating/deleting.
- **Loans Module**: Issue books to users, track statuses (pending, returned, late), update or delete loans.
- **Reviews Module**: Add, view, update, delete reviews for books.
- **Middlewares & Utilities**:
  - **Authentication**: JWT-based, role-based authorization.
  - **Multer**: File upload handling, with cleanup utility for unused files.
  - **Validation**: `express-validator` chains for body, query, path params.
  - **Error Handling**: Centralized error handler (`ApiError`, `ApiResponse`), cleans up uploads on failure.
  - **Cloudinary Setup**: For image storage (profile pictures, book covers).
  - **Environment Config**: Using dotenv for secrets and URLs.

## Tech Stack
- **Runtime & Framework**: Node.js, Express
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JSON Web Tokens (JWT)
- **Validation**: express-validator
- **File Uploads**: multer, Cloudinary SDK
- **Utilities**: dotenv, bcrypt (password hashing), async-handler pattern
- **Testing**: Postman collections

## Prerequisites
- Node.js (>=14) and npm installed
- MongoDB instance (local or cloud)
- Cloudinary account for storing images
- Environment variables (see next section)

## Installation & Setup

1. **Clone the repository**  
   ```bash
   git clone https://github.com/arshitcc/Library-Management-System-API.git
   cd Library-Management-System-API
    ````  

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file** in project root with:

   ```env
   PORT= 8000
   CORS_ORIGIN=__cors_origin__

   MONGODB_URL=__mongodb_url__
   MONGODB_NAME=__mongodb_name__

   ACCESS_TOKEN_SECRET=__access_token_secret__
   ACCESS_TOKEN_EXPIRY=__access_token_expiry__
   REFRESH_TOKEN_SECRET=__refresh_token_secret__
   REFRESH_TOKEN_EXPIRY=__refresh_token_expiry__

   CLOUDINARY_CLOUD_NAME=__cloudinary_cloud_name__
   CLOUDINARY_API_KEY=__cloudinary_api_key__
   CLOUDINARY_API_SECRET=__cloudinary_api_secret__
   CLOUDINARY_FOLDER_NAME=__cloudinary_folder_name__

   MAILTRAP_SMTP_HOST=__mailtrap_smtp_host__
   MAILTRAP_SMTP_PORT=__mailtrap_smtp_port__
   MAILTRAP_SMTP_USERNAME=__mailtrap_smtp_username__
   MAILTRAP_SMTP_PASSWORD=__mailtrap_smtp_password__
   MAILTRAP_SENDEREMAIL=__mailtrap_smtp_senderemail__


   # Optional: other configs
   ```

   * Replace placeholders with real values.
   * Keep `.env` out of version control.

4. **Run the server**

   * In development:

     ```bash
     npm run dev
     ```

     (`dev` script uses nodemon.)
   * In production:

     ```bash
     npm start
     ```

## Folder Structure

```
Library-Management-System-API/
├── public/images/
│   │      ├── .gitkeep
├── src/
│   ├── controllers/
│   │   ├── books.controller.js
│   │   ├── authors.controller.js
│   │   ├── users.controller.js
│   │   ├── loans.controller.js
│   │   ├── reviews.controller.js
│   ├── models/
│   │   ├── books.model.js
│   │   ├── authors.model.js
│   │   ├── users.model.js
│   │   ├── loans.model.js
│   │   ├── reviews.model.js
│   ├── routes/
│   │   ├── books.routes.js
│   │   ├── authors.routes.js
│   │   ├── users.routes.js
│   │   ├── loans.routes.js
│   │   ├── reviews.routes.js
│   ├── middleware/
│   │   ├── validators/
│   │   │   ├── authors.validator.js
│   │   │   ├── books.validator.js
│   │   │   ├── loans.validator.js
│   │   │   ├── reviews.validator.js
│   │   │   ├── users.validator.js
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── multer.middleware.js
│   │   ├── validation.middleware.js
│   ├── utils/
│   │   ├── async-handler.js
│   │   ├── api-error.js
│   │   ├── api-response.js
│   │   ├── cloudinary.js
│   │   ├── helper.js
│   │   ├── env.js
│   ├── config/
│   │   ├── db.js
│   └── server.js
├── .env
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc
├── package-lock.json
├── package.json
└── README.md
```

## Environment Variables

* `PORT`: Port number for the server (default: 8000).
* `CORS_ORIGIN`: Allowed origin for CORS requests.

* `MONGODB_URL`: MongoDB connection URL.
* `MONGODB_NAME`: Name of the MongoDB database.

* `ACCESS_TOKEN_SECRET`: Secret key for signing access tokens.
* `ACCESS_TOKEN_EXPIRY`: Access token expiry duration (e.g., `15m`).
* `REFRESH_TOKEN_SECRET`: Secret key for signing refresh tokens.
* `REFRESH_TOKEN_EXPIRY`: Refresh token expiry duration (e.g., `7d`).

* `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name.
* `CLOUDINARY_API_KEY`: Cloudinary API key.
* `CLOUDINARY_API_SECRET`: Cloudinary API secret.
* `CLOUDINARY_FOLDER_NAME`: Folder name in Cloudinary for storing uploads.

* `MAILTRAP_SMTP_HOST`: Mailtrap SMTP host for testing emails.
* `MAILTRAP_SMTP_PORT`: Mailtrap SMTP port.
* `MAILTRAP_SMTP_USERNAME`: Mailtrap SMTP username.
* `MAILTRAP_SMTP_PASSWORD`: Mailtrap SMTP password.
* `MAILTRAP_SENDEREMAIL`: Sender email address used in outgoing emails.


## Running & Testing

* **Start server**: `npm run dev`
* **API documentation**: Refer to **README.md** or Postman collection.


## API Documentation

Refer to the detailed API docs (e.g., `docs/README.md`) which cover:

* **Books**:

  * `GET /books` (filters, pagination)
  * `GET /books/:id`
  * `POST /books`
  * `PUT /books/:id`
  * `DELETE /books/:id`
* **Authors**:

  * `GET /authors` (filters, pagination)
  * `GET /authors/:id`
  * `POST /authors`
  * `PUT /authors/:id`
  * `DELETE /authors/:id`
* **Users**:

  * `POST /users/register`
  * `POST /users/login`
  * `GET/PUT /users/profile`
  * `PUT /users/profile-picture`
  * `GET /users` (admin, filter by role, pagination)
  * `GET/PUT/DELETE /users/:id` (admin)
  * `PUT /users/:id/role` (admin)
* **Loans**:

  * `GET /loans` (filter by status, pagination)
  * `POST /loans`
  * `PUT /loans/:id` (admin)
  * `DELETE /loans/:id` (admin)
* **Reviews**:

  * `GET /books/:bookId/reviews` (filters, pagination)
  * `POST /books/:bookId/reviews`
  * `PUT /books/:bookId/reviews/:reviewId`
  * `DELETE /books/:bookId/reviews/:reviewId`

Authentication is via `Authorization: Bearer <token>` header. Use the provided Postman/Swagger collection to explore endpoints.

## Error Handling

* Errors thrown via `ApiError` are caught by the global error middleware and returned in a consistent JSON format:

  ```json
  {
    "status": <HTTP status code>,
    "success": false,
    "message": "<error message>",
    "errors": [ ... ]
  }
  ```

## File Uploads

* Handled with multer; images uploaded to Cloudinary.
* Cleanup utility removes unused files on validation or other errors.

## Security

* Passwords hashed (bcryptjs).
* JWT secret stored in env.
* Input validation via express-validator.


## Contributing

1. Fork the repo.
2. Create a feature branch: `git checkout -b feature/xyz`.
3. Commit changes with clear messages.
4. Push and open a PR.
5. Ensure tests pass and linting is clean.

## License

Specify your license, e.g., MIT:

```
MIT License
...
```

## Contact

* Maintainer: Your Name & email
* Repository: [https://github.com/arshitcc/Library-Management-System-API](https://github.com/arshitcc/Library-Management-System-API)

```

Save this as `README.md`, and adjust URLs, examples, and scripts to match your actual implementation.
```
