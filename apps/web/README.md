# AskVirtualHealthcare

## Tech Stack and Philosophy

This project is mainly build in typescript using the following tools and services:

- [Next.js](https://nextjs.org): Next.js enables you to create high-quality
  web applications with the power of React components.
- [Neon](https://neon.tech): A fully managed serverless Postgress database provider with autoscaling and branching enabling creating development branches with copies of data and schema from the production database instaneously.
- [tRPC](https://trpc.io): Easily build & consume fully typesafe APIs without schemas or code generation.

We believe in [Backends for Frontends pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends) and develop with the idea of a tight integration between the front end and the backend. This is especially important in our approach which involves ideas such as:

- Using tRPC and it's [React Query Integration](https://trpc.io/docs/client/react) to have full type inference and ready to go server state management on our expo app without any extra boiler plate.
- Using [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) to write UI that is automatically rendered and cached on the server and avoid unnecessary data fetching on the client.
- Using [Server Actions and Mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) to directly invoke server code from the client eliminating the need for complex state management and API calls in the client.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/)(v18 or later)
- [npm](https://www.npmjs.com/)


## Installation

1. Clone the repository by running the following:

```bash
git@github.com:Nextgentechs/askvirtualhealthcare.git
```

2. Navigate to the project directory:

```bash
cd askvirtualhealthcare
```

3. Install dependencies

```bash
npm install
```


#### Good to Know

This application is built using the [Next.js](https://nextjs.org) framework and hosted on [Vercel](https://vercel.com).

If you are new to [tRPC](https://trpc.io) or have any questions please reach out to get a brief walkthrough.

#### Running the app

```bash
npm run dev
```

This will start a server available on `localhost:3000` unless you are simultaneously running another app that is using that port in which case you might have a different port.
