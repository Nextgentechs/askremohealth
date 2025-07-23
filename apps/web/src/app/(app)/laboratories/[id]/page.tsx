import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@web/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@web/components/ui/breadcrumb';
import { api } from '@web/trpc/server';
import { notFound } from 'next/navigation';

// Placeholder for a calendar component (replace with real one if available)
function LabCalendar({ availability }: { availability: any[] }) {
  // Try to render a simple table if availability is an array of slots
  if (!availability.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Lab Appointment Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-muted-foreground">No availability set for this lab.</span>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Lab Appointment Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="min-w-full text-xs text-left">
          <thead>
            <tr>
              <th className="pr-4 pb-2">Day</th>
              <th className="pr-4 pb-2">Start</th>
              <th className="pr-4 pb-2">End</th>
            </tr>
          </thead>
          <tbody>
            {availability.map((slot: any, i: number) => (
              <tr key={slot.id || i}>
                <td className="pr-4 py-1 capitalize">{slot.day_of_week}</td>
                <td className="pr-4 py-1">{slot.start_time}</td>
                <td className="pr-4 py-1">{slot.end_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function LabsCard({ lab }: { lab: any }) {
  return (
    <Card className="h-fit w-full p-6 flex-col justify-between gap-8 rounded-xl border shadow-sm transition-all duration-300 sm:flex-row lg:flex lg:max-w-md lg:flex-row xl:max-w-lg 2xl:max-w-xl">
      <div className="flex flex-1 flex-row gap-5 md:gap-8 xl:gap-10">
        <div>
          <h2 className="text-xl font-bold text-primary mb-2">{lab.name}</h2>
          <div className="text-muted-foreground text-sm">
            {lab.address}
            {lab.town ? `, ${lab.town}` : ''}
            {lab.county ? `, ${lab.county}` : ''}
          </div>
        </div>
      </div>
    </Card>
  );
}

function LabTests({ tests }: { tests: any[] }) {
  if (!tests.length) return null;
  return (
    <Card className="flex w-full flex-col rounded-xl border px-0 shadow-sm">
      <CardHeader className="flex w-full items-start border-b px-6 pb-6">
        <CardTitle className="text-lg font-semibold md:text-xl">Available Lab Tests</CardTitle>
      </CardHeader>
      <CardContent className="flex w-full flex-col items-start gap-2 pt-6 text-foreground">
        <ul className="list-disc pl-4">
          {tests.map((test) => (
            <li key={test.test?.id || test.testId || test.id} className="mb-1">
              <span className="font-medium">{test.test?.name || test.testId || test.id}</span>
              {typeof test.amount === 'number' && (
                <span className="ml-2 text-xs text-muted-foreground">(KES {test.amount})</span>
              )}
              {test.collection && (
                <span className="ml-2 text-xs text-muted-foreground">[{test.collection}]</span>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  // Fetch lab details
  const lab = await api.labs.getLabById({ placeId: id });
  if (!lab) return notFound();

  // Fetch lab tests
  let tests: any[] = [];
  try {
    tests = await api.labs.getLabTestsByLabId({ labId: id });
  } catch (e) {
    tests = [];
  }

  // Fetch lab availability
  let availability: any[] = [];
  try {
    availability = await api.labs.getLabAvailabilityByLabId({ labId: id });
  } catch (e) {
    availability = [];
  }

  return (
    <main className="container mx-auto mb-48 mt-12 flex min-h-screen w-full flex-col gap-12">
      <Breadcrumb className="lg:ps-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/laboratories">Laboratories</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{lab.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col gap-8 lg:flex-row">
        <LabsCard lab={lab} />
        <div className="flex flex-1 flex-col gap-8">
          <LabTests tests={tests} />
          <LabCalendar availability={availability} />
          {/* TODO: Add booking UI for lab tests and available timeslots */}
          {/* TODO: Add reviews section if needed */}
        </div>
      </div>
    </main>
  );
}
