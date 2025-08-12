"use client";

import { DataTable } from "@web/components/data-table";
import { useCurrentUser } from "@web/hooks/use-current-user";
import { api } from "@web/trpc/react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export type Appointment = {
  id: string;
  date: Date;
  time: string;
  status: string;
  patientName: string;
  patientId: string;
};

interface LabAppointmentOutput {
  id: string;
  appointmentDate: Date;
  patientNotes: string | null;
  status: string;
  patient: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: "patientName",
    header: "Patient Name",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date: Date = row.getValue("date");
      return format(date, "PPP");
    },
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="flex gap-2">
          <Link
            href={`/lab/appointments/${appointment.id}`}
            className="text-blue-600 hover:underline"
          >
            View Details
          </Link>
          {/* Add more action buttons here, e.g., Complete, Cancel */}
        </div>
      );
    },
  },
];

export default function LabAppointmentsPage() {
  const { user, loading: isUserLoading } = useCurrentUser();
  const labId = user?.id;

  const {
    data: appointments,
    isLoading: isAppointmentsLoading,
    error,
  } = api.labs.getLabAppointments.useQuery(
    { labId: labId! },
    { enabled: !!labId }
  );

  if (isUserLoading || isAppointmentsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">Error loading appointments: {error.message}</div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center text-gray-500">No scheduled appointments found.</div>
    );
  }

  // Map the fetched appointments to the Appointment type
  const formattedAppointments: Appointment[] = appointments.map((appt: LabAppointmentOutput) => ({
    id: appt.id,
    date: appt.appointmentDate,
    time: format(appt.appointmentDate, "HH:mm"), // Extract time from appointmentDate
    status: appt.status,
    patientName: `${appt.patient.user.firstName} ${appt.patient.user.lastName}`,
    patientId: appt.patient.id,
  }));

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Scheduled Appointments</h1>
      <DataTable columns={columns} data={formattedAppointments} />
    </div>
  );
}
