
# Contentful Products API

This is a NestJS-based back end that synchronizes product data from the Contentful API, stores it in a PostgreSQL database, and exposes a set of public and private REST endpoints. The API provides endpoints for listing, filtering, and deleting products as well as several analytical reports. The project is Dockerized and integrates Redis for caching.

## Features

- **Contentful Sync:**  
  Scheduled requests (currently every hour) to fetch Product data from Contentful and upsert into the database.

- **Public Endpoints:**  
  Paginated product listing (with filters by name, category, and price range) that excludes deleted items.

- **Private Endpoints (Reports):**  
  JWT-protected endpoints providing:
  - Percentage of deleted products.
  - Percentage of non-deleted products with price filtering and optional date range.
  - Price statistics (e.g. average price) grouped by category.

- **Authentication:**  
  Endpoints for user registration and login returning JWT tokens.

- **Caching:**  
  Redis-backed caching is used for frequently accessed data (products list and reports).

- **Documentation:**  
  Swagger API documentation is available at `/api/docs`.

- **Testing:**  
  Test coverage of at least 30% for server components.

## Setup & Running

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose must be installed.

### Environment Variables

The application uses a number of required environment variables. You can find a sample in the `.env` file:

```
# App
NODE_ENV=production
PORT=3000
GLOBAL_PREFIX=api

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=1h

# Postgres (matches compose service)
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

# REDIS
REDIS_PORT=

# Contentful
CONTENTFUL_SPACE_ID=9xs1613l9f7v
CONTENTFUL_ACCESS_TOKEN=I-ThsT55eE_B3sCUWEQyDT4VqVO3x__20ufuie9usns
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_CONTENT_TYPE=product
CONTENTFUL_PAGE_SIZE=100

# Sync cron (every hour on the hour)
SYNC_CRON=0 * * * *
```

### Running the Application

1. **Clone the Project:**

   ```
   git clone <your-repo-url>
   cd contentful-products-api
   ```

2. **Run via Docker Compose:**

   The project includes a `docker-compose.yml` file that sets up the API server, PostgreSQL, and Redis containers. Simply run:

   ```
   docker-compose up --build
   ```

   This command will build the server image and start the containers.

3. **Access the API Documentation:**

   Once the application is running, access Swagger at [http://localhost:3000/api/docs](http://localhost:3000/api/docs) to explore the available endpoints and try them out.

### Forcing a Data Refresh

For the initial population of the database with data from Contentful, you can manually trigger the sync operation by:

- Restarting the application (as the scheduled job takes care of the syncing), or
- Exposing an endpoint (if implemented) in the `SyncModule` to force a refresh.

_Note: The application is designed to automatically fetch the latest product data from Contentful every hour._

## Assumptions & Choices

- **Database Choice:**  
  PostgreSQL was chosen as the database to store product and user data.

- **ORM:**  
  TypeORM is used for interacting with the PostgreSQL database.

- **Dockerization:**  
  The service is fully Dockerized using Docker Compose, making local setup simple.

- **Rate Limiting & Caching:**  
  Redis is integrated to cache frequently requested endpoints and improve performance. Although rate limiting was implemented using NestJS's ThrottlerModule, it has been removed in this version as per current requirements.

- **Authentication:**  
  JWT is used for user authentication and securing private endpoints.

- **Documentation Tools:**  
  Swagger is used to provide comprehensive API documentation.

## Tests & Linting

Unit tests and linting are integrated into the project. These run on GitHub Actions as part of the CI/CD process.

- **Running Tests Locally:**

  ```
  npm run test
  ```

- **Running Linters:**

  ```
  npm run lint
  ```

## Additional Notes

- Ensure that your `.env` file is correctly configured and located in the project root.
- The application assumes that the Contentful API credentials are valid and that the Contentful environment is properly set up.
- For production deployments, consider using persistent storage for Docker volumes (for PostgreSQL) and more robust security practices for secrets management.

