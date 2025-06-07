declare module 'emailjs' {
    export class SMTPClient {
      constructor(options: {
        user?: string;
        password?: string;
        host: string;
        ssl?: boolean;
        port?: number;
      });
  
      send(
        message: {
          text: string;
          from: string;
          to: string;
          subject: string;
        },
        callback?: (err: Error | null, message: unknown) => void

      ): void;
    }
  }
  