import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { FileSearch, CalendarClock, Hospital } from "lucide-react";

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="flex flex-col gap-10 bg-popover px-16 pb-6 pt-24"
    >
      <h2 className="text-center text-3xl text-primary">How It works</h2>
      <div className="flex items-center justify-center gap-10">
        <Card className="flex h-80 w-[410px] flex-col items-center justify-center gap-6">
          <CardHeader>
            <CardTitle className="h-20 w-20 items-center justify-center bg-[#FEF7E0]">
              <FileSearch
                color="#B95000"
                size={52}
                absoluteStrokeWidth={true}
              />
            </CardTitle>
            <CardDescription>Search for Doctor or Hospital</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Find the right doctor or hospital by filtering through speciality,
              location or name
            </p>
          </CardContent>
        </Card>

        <Card className="flex h-80 w-[410px] flex-col items-center justify-center gap-6">
          <CardHeader>
            <CardTitle className="h-20 w-20 items-center justify-center bg-[#FEF0ED]">
              <CalendarClock
                color="#C5221F"
                size={52}
                absoluteStrokeWidth={true}
              />
            </CardTitle>
            <CardDescription>Book an Appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Schedule an appointment—whether online or in-person. Get instant
              confirmations and timely reminders.
            </p>
          </CardContent>
        </Card>
        <Card className="flex h-80 w-[410px] flex-col items-center justify-center gap-6">
          <CardHeader>
            <CardTitle className="h-20 w-20 items-center justify-center bg-[#E6F4EA]">
              <Hospital color="#137333" size={52} absoluteStrokeWidth={true} />
            </CardTitle>
            <CardDescription>Attend Your Appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Meet your doctor either virtually through a video call or in
              person at a hospital or clinic
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
