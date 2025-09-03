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

## sample env
## 📝 Sample `.env` File

```env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb+srv://sahandilshanprojects_db_user:Q8wAFJHeXjbH2Sr3@cluster0.lfmtf9s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
pw=Q8wAFJHeXjbH2Sr3
username=sahandilshanprojects_db_user
JWT_ACCESS_SECRET=change_me_access
JWT_REFRESH_SECRET=change_me_refresh
JWT_ACCESS_TTL=900s
JWT_REFRESH_TTL=7d
UPLOAD_DIR=./uploads
CORS_ORIGIN=http://localhost:9002
CACHE_TTL=30
RATE_LIMIT_TTL=60
RATE_LIMIT=120
CLOUDINARY_CLOUD_NAME=dcc0k5bzk
CLOUDINARY_API_KEY=751338316729858
CLOUDINARY_API_SECRET=VF7Bf1arKudGaDqs8h7UqUM2cbE
SENDGRID_API_KEY=addKey
FROM_EMAIL=sahandilshan.contact@gmail.com
FRONTEND_URL=http://localhost:9002
```


## API Documentation

You can explore and test the API endpoints using Swagger here:  
[https://ceyblogger-api-production.up.railway.app/docs](https://ceyblogger-api-production.up.railway.app/docs)

## Features

- **User Management**: Register, login, update profile, password reset  
- **Posts**: Create, read, update, delete posts, filter by author/tag/search  
- **Comments**: Add comments, threaded replies, like/unlike comments  
- **Notifications**: Email notifications to post authors on new comments  
- **Authentication**: JWT-based auth with protected endpoints  


## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
