# Script Symphony

Script Symphony is a coding blog site designed for managing and publishing blog articles. It provides a platform where users can create, edit, and manage their blog content efficiently. The application is built with Node.js and Express.js, integrated with PostgreSQL for database management, and leverages various tools and libraries for authentication, file uploading, and testing.

**Note**: you can find the frontend repository [Here](https://github.com/ibrahim11elian/My-Blog)

## Table of content

- [Folder Structure](#folder-structure)
- [Features](#features)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Scripts](#scripts)
- [Author](#author)

## Folder Structure

```
├───build
│   ├───cache
│   ├───middleware
│   ├───models
│   ├───routes
│   │   └───controllers
│   └───utilities
├───coverage
│   └───lcov-report
│       └───src
│           ├───cache
│           ├───middleware
│           ├───models
│           ├───routes
│           │   └───controllers
│           └───utilities
├───migrations
│   └───sqls
├───src
│   ├───cache
│   │   └───tests
│   ├───middleware
│   │   └───tests
│   ├───models
│   │   └───tests
│   ├───routes
│   │   └───controllers
│   │       └───tests
│   └───utilities
│       └───tests
└───uploads
```

## Features

- **User Management**: The application includes user information management functionality.
- **Article Management**: User can create, edit, and delete blog articles.
- **File Upload**: The application supports file uploads for article cover images. It integrates with Cloudinary for storing and managing uploaded images.
- **Authentication**: Authentication middleware is implemented to secure routes and endpoints. JSON Web Tokens (JWT) are used for user authentication.
- **Cache Management**: A cache manager is implemented to cache recent articles, improving performance by reducing database queries.
- **Database Migrations**: Database migrations are handled using db-migrate, making it easy to manage database schema changes and updates.
- **Testing**: The application includes comprehensive test coverage, with Jest as the testing framework. Test scripts are provided for running tests and generating coverage reports.

## Getting Started

1. **Clone the repository** to your local machine using
   ```
   git clone https://github.com/ibrahim11elian/scriptSymphony-backend.git
   ```
2. **Navigate** to the project directory `cd scriptSymphony-backend`
3. **Install Dependencies**: Run `npm install` to install all project dependencies.
4. **Environment Variables**: Create the `.env` file with environment-specific variables, such as Cloudinary API keys and database credentials.

```
PORT=

PG_HOST=
PG_USER=
PG_DATABASE=
PG_TEST_DATABASE=
PG_PASSWORD=
PG_PORT=
NODE_ENV=DEV

SALT_ROUNDS=10

TOKEN_SECRET=

# cloudinary keys
CLOUDINARY_API_SECRET=
CLOUDINARY_API_KEY=
CLOUDINARY_CLOUD_NAME=

# admin user name and password
ADMIN_NAME=
ADMIN_PASSWORD=

```

5. **Create your DataBase**: create database in postgres with the name you provide in `.env` file (`PG_DATABASE` and `PG_TEST_DATABASE` for testing).
6. **Database Migrations**: Run `npm run migrate` to apply database migrations and set up the database schema.
7. **Build the server**: running `npm run build`. This will generate a `build` folder.
8. **Testing**: Run `npm test` to execute tests and generate coverage reports.
9. **Start the Server**: Run `npm start` to start the server. The application will be accessible at the `.env` specified port, if there isn't (default is 3000).

## Documentation

- **API Documentation**: Refer to the [API.md](./API.md) file for detailed documentation of the endpoints provided by the application.
- **Database Schema**: The [schema.md](./schema.md) file contains the SQL schema for the database tables used in the application.
- **Entity-Relationship Diagram (ERD)**: The [ERD.png](./ERD.png) file visualizes the relationships between different entities in the database.

## Scripts

- `npm run build`: Compile TypeScript files to JavaScript.
- `npm test`: Run tests and generate coverage reports.
- `npm start`: Start the server using nodemon for automatic reloading.
- `npm run migrate`: Apply database migrations.

## Built with

- **Express.js**: Web framework for Node.js.
- **PostgreSQL**: Relational database management system.
- **Multer**: Middleware for handling file uploads.
- **Cloudinary**: Cloud-based image management solution.
- **JSON Web Token**: Library for generating and verifying JWT tokens.
- **bcrypt**: Library for hashing passwords securely.
- **db-migrate**: Database migration tool for managing schema changes.
- **dotenv**: Library for loading environment variables from a `.env` file.
- **Jest**: Testing framework for JavaScript and TypeScript.

## Author

 <p align="left">

<a href="https://www.linkedin.com/in/ibrahim-ahmed-a8bba9196" target="_blank">![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)
</a>
<a href="https://www.facebook.com/ibrahim11ahmed" target="_blank">![Facebook](https://img.shields.io/badge/Facebook-%231877F2.svg?style=for-the-badge&logo=Facebook&logoColor=white)
</a>
<a href="mailto:ibrahim11elian@gmail.com" target="_blank">![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)
</a>
<a href="tel:+201157676284" target="_blank">![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
</a>
<a href="https://www.instagram.com/ibrahim11ahmed/" target="_blank">![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?style=for-the-badge&logo=Instagram&logoColor=white)
</a>
<a href="https://twitter.com/ibrahim11elian" target="_blank">![Twitter](https://img.shields.io/badge/Twitter-%231DA1F2.svg?style=for-the-badge&logo=Twitter&logoColor=white)
<a href="https://leetcode.com/ibrahim11elian" target="_blank">![LeetCode](https://img.shields.io/badge/LeetCode-000000?style=for-the-badge&logo=LeetCode&logoColor=#d16c06)

</p>
