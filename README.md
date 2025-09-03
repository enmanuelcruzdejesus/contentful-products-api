<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

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

