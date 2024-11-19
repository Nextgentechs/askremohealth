import { Button } from "~/components/ui/button";

export default async function Home() {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center">
      <Button variant="default">Click me</Button>
    </main>
  );
}
