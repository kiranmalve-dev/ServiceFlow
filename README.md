# ServiceFlow

**ServiceFlow** is a service booking web application that allows customers to explore services and manage their bookings, while administrators can manage services, users, and bookings through an admin dashboard.

## Features

### Customer
- Browse available services.
- View service details.
- Book services online.
- View and manage personal bookings.
- Cancel bookings when permitted.
- Access a responsive user interface.

### Admin Dashboard
- Admin authentication.
- Manage and view bookings.
- Manage services.
- View and manage users.
- Search, filter, and paginate dashboard data.

### Testing
- Component testing using Jest.
- React component tests using React Testing Library.
- Test coverage for important customer and admin features.

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Jest
- React Testing Library

### Backend
- Node.js
- Express.js
- TypeScript
- REST API

## Project Structure

```text
ServiceFlow/
├── client/       # Frontend application
├── server/       # Backend API
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### Prerequisites
- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/kiranmalve-dev/ServiceFlow.git
cd ServiceFlow
```

### 2. Set up the frontend

```bash
cd client
npm install
npm run dev
```

### 3. Run frontend tests

Open a terminal inside the `client` directory and run:

```bash
npm test
```

### 4. Set up the backend

Open another terminal:

```bash
cd server
npm install
npm run dev
```

> Note: Configure the required environment variables and database settings according to the backend configuration before running the application.

## Testing Status

Frontend component testing is being performed using Jest and React Testing Library.

The tests cover components and pages across customer and admin features. Some tests may require additional fixes before the entire test suite passes.

## Authentication

The application supports separate customer and admin authentication flows to protect relevant pages and features.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run the relevant tests.
5. Submit a pull request.

##  License

A license has not yet been specified for this project.
