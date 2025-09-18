# Ask Virtual Healthcare

A modern healthcare platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Modern UI with Tailwind CSS
- Type-safe API with tRPC
- Authentication with Clerk
- Database with Drizzle ORM
- Real-time video consultations with Twilio
- Email notifications with Nodemailer
- Form handling with React Hook Form
- State management with Zustand
- UI components with Radix UI
- Animations with Framer Motion
- Carousel with Embla Carousel
- Date handling with date-fns
- Validation with Zod
- Environment variables with t3-env
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks
- Commitlint for commit message linting
- Test CI/CD automation

## Tech Stack
- Mchng
- [Next.js](https://nextjs.org/): React framework for production
- [TypeScript](https://www.typescriptlang.org/): Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework
- [tRPC](https://trpc.io/): End-to-end typesafe APIs
- [Drizzle ORM](https://orm.drizzle.team/): TypeScript ORM
- [Twilio](https://www.twilio.com/): Video consultations
- [Nodemailer](https://nodemailer.com/): Email notifications
- [React Hook Form](https://react-hook-form.com/): Form handling
- [Zustand](https://zustand-demo.pmnd.rs/): State management
- [Radix UI](https://www.radix-ui.com/): UI components
- [Framer Motion](https://www.framer.com/motion/): Animations
- [Embla Carousel](https://embla-carousel.github.io/): Carousel
- [date-fns](https://date-fns.org/): Date utilities
- [Zod](https://zod.dev/): Schema validation
- [t3-env](https://env.t3.gg/): Environment variables
- [ESLint](https://eslint.org/): Code linting
- [Prettier](https://prettier.io/): Code formatting
- [Husky](https://typicode.github.io/husky/): Git hooks
- [Commitlint](https://commitlint.js.org/): Commit message linting

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
apps/
├── web/           # Next.js web application
│   ├── src/
│   │   ├── app/   # App router pages
│   │   ├── components/  # React components
│   │   ├── server/  # Server-side code
│   │   └── utils/  # Utility functions
│   └── public/    # Static assets
└── api/           # API server
    └── src/
        ├── routers/  # API routes
        └── services/ # Business logic
```

## Contributing

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Twilio Documentation](https://www.twilio.com/docs)
- [Nodemailer Documentation](https://nodemailer.com/about/)
- [React Hook Form Documentation](https://react-hook-form.com/get-started)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Embla Carousel Documentation](https://embla-carousel.github.io/embla-carousel/docs/)
- [date-fns Documentation](https://date-fns.org/docs/Getting-Started)
- [Zod Documentation](https://zod.dev/docs/getting-started)
- [t3-env Documentation](https://env.t3.gg/docs/introduction)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Husky Documentation](https://typicode.github.io/husky/getting-started.html)
- [Commitlint Documentation](https://commitlint.js.org/#/)
