import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className=" h-full w-full m-auto">
      <Button onClick={() => console.log("clicked")} className="font-normal">
        Book Appointment
      </Button>
    </div>
  );
}
