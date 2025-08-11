"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@web/hooks/use-toast';
import { api } from '@web/trpc/react';
import { Loader } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import type { LabTestAvailable, Lab } from '@web/types/globals';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from './ui/command';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { ChevronsUpDown, Check } from 'lucide-react';

// Schema for booking a lab test
const labAppointmentSchema = z.object({
  testId: z.string().min(1, 'Please select a test'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  // Patient info
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email'),
  dob: z.string().min(1, 'Date of birth is required'),
  // Optional notes
  notes: z.string().optional(),
});

function LabCard({ lab }: { lab: Lab }) {
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

function PatientInformation({ disabled }: { disabled?: boolean }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<z.infer<typeof labAppointmentSchema>>();

  return (
    <Card className="flex flex-col rounded-xl border px-0 shadow-sm">
      <CardHeader className="flex w-full items-start border-b px-6 pb-6">
        <CardTitle className="text-lg font-semibold md:text-xl">
          Patient Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid w-full gap-6 pt-6 text-foreground sm:grid-cols-2">
        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="firstName">
            First Name
          </Label>
          <Input
            {...register('firstName')}
            id="firstName"
            placeholder="Enter first name"
            className="ps-4"
            disabled={disabled}
          />
          {errors.firstName && (
            <span className="text-sm font-medium text-destructive">
              {errors.firstName.message}
            </span>
          )}
        </div>
        <div className="flex w-full flex-1 flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="lastName">
            Last Name
          </Label>
          <Input
            {...register('lastName')}
            id="lastName"
            placeholder="Enter last name"
            className="ps-4"
            disabled={disabled}
          />
          {errors.lastName && (
            <span className="text-sm font-medium text-destructive">
              {errors.lastName.message}
            </span>
          )}
        </div>
        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="phoneNumber">
            Phone Number
          </Label>
          <Input
            {...register('phone')}
            id="phoneNumber"
            type="tel"
            placeholder="Enter phone number"
            className="ps-4"
            disabled={disabled}
          />
          {errors.phone && (
            <span className="text-sm font-medium text-destructive">
              {errors.phone.message}
            </span>
          )}
        </div>
        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="email">
            Email Address
          </Label>
          <Input
            {...register('email')}
            id="email"
            type="email"
            placeholder="Enter email address"
            className="ps-4"
            disabled={disabled}
          />
          {errors.email && (
            <span className="text-sm font-medium text-destructive">
              {errors.email.message}
            </span>
          )}
        </div>
        <div className="flex w-full flex-col items-start gap-2">
          <Label className="text-foreground" htmlFor="dob">
            Date of Birth
          </Label>
          <Input {...register('dob')} id="dob" type="date" className="ps-4" disabled={disabled} />
          {errors.dob && (
            <span className="text-sm font-medium text-destructive">
              {errors.dob.message}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NotesForLab() {
  const { register } = useFormContext<z.infer<typeof labAppointmentSchema>>();
  return (
    <Card className="flex flex-col rounded-xl border px-0 shadow-sm">
      <CardHeader className="flex w-full items-start border-b px-6 pb-6">
        <CardTitle className="text-lg font-semibold md:text-xl">
          Notes for Lab
        </CardTitle>
      </CardHeader>
      <CardContent className="flex w-full flex-col items-start gap-2 pt-6 text-foreground">
        <Label className="text-foreground" htmlFor="notes">
          Additional Notes{' '}
          <span className="text-sm text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          {...register('notes')}
          id="notes"
          placeholder="Please provide any additional information..."
          className="min-h-[80px] resize-none ps-4"
        />
      </CardContent>
    </Card>
  );
}

function TestAndTimeSelection({ tests, availableTimes }: { tests: LabTestAvailable[]; availableTimes: string[] }) {
  const { register, formState: { errors }, watch, setValue } = useFormContext<z.infer<typeof labAppointmentSchema>>();
  const selectedTestId = watch('testId');
  const [testQuery, setTestQuery] = useState('');
  const normalizedQuery = testQuery.trim().toLowerCase();
  const filteredTests = normalizedQuery
    ? tests.filter((t) => (t.test?.name || '').toLowerCase().includes(normalizedQuery))
    : tests;

  return (
    <Card className="flex flex-col rounded-xl border px-0 shadow-sm">
      <CardHeader className="flex w-full items-start border-b px-6 pb-6">
        <CardTitle className="text-lg font-semibold md:text-xl">
          Select Test & Time
        </CardTitle>
      </CardHeader>
      <CardContent className="flex w-full flex-col gap-6 pt-6 text-foreground">
        <div className="flex flex-col gap-2">
          <Label htmlFor="testId">Lab Test</Label>
          <Input
            placeholder="Search test by name..."
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            className="ps-4"
          />
          <select {...register('testId')} id="testId" className="ps-4 py-2 border rounded">
            <option value="">Select a test</option>
            {(filteredTests.length > 0 ? filteredTests : tests).map((test) => (
              <option key={test.testId || test.id} value={test.testId || test.id}>
                {test.test?.name || 'Unknown Test'} - {test.test?.generalCategory || 'Unknown Category'}
              </option>
            ))}
            {filteredTests.length === 0 && (
              <option value="" disabled>
                No tests match "{testQuery}"
              </option>
            )}
          </select>
          {errors.testId && (
            <span className="text-sm font-medium text-destructive">
              {errors.testId.message}
            </span>
          )}
          
          {/* Display selected test details */}
          {selectedTestId && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              {(() => {
                const selectedTest = tests.find(t => (t.testId || t.id) === selectedTestId);
                if (!selectedTest) return null;
                
                return (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-primary">
                      {selectedTest.test?.name || 'Test Details'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">General Category:</span>
                        <p className="text-foreground">{selectedTest.test?.generalCategory || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Specific Category:</span>
                        <p className="text-foreground">{selectedTest.test?.specificCategory || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Sample Type:</span>
                        <p className="text-foreground">{selectedTest.test?.sampleType || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Collection Method:</span>
                        <p className="text-foreground capitalize">{selectedTest.collection || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Price:</span>
                        <p className="text-foreground font-semibold">KES {selectedTest.amount?.toLocaleString() || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Date</Label>
          <Input type="date" {...register('date')} id="date" className="ps-4" />
          {errors.date && (
            <span className="text-sm font-medium text-destructive">
              {errors.date.message}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="time">Time Slot</Label>
          <select {...register('time')} id="time" className="ps-4 py-2 border rounded">
            <option value="">Select a time</option>
            {availableTimes.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          {errors.time && (
            <span className="text-sm font-medium text-destructive">
              {errors.time.message}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PatientSearch({ onSelect }: { onSelect: (patient: any) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const { data, isLoading } = api.patients.searchPatients.useQuery({ query }, { enabled: query.length > 0 });

  return (
    <div className="mb-4">
      <Label>Search Patient</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selected ? `${selected.firstName} ${selected.lastName} (${selected.email})` : 'Select patient...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Type a name..."
              value={query}
              onValueChange={setQuery}
              autoFocus
            />
            <CommandList>
              {isLoading ? (
                <CommandItem disabled>Loading...</CommandItem>
              ) : (
                <>
                  <CommandEmpty>No patient found.</CommandEmpty>
                  {data?.map((patient: any) => (
                    <CommandItem
                      key={patient.id}
                      value={`${patient.firstName} ${patient.lastName}`}
                      onSelect={() => {
                        setSelected(patient);
                        setOpen(false);
                        onSelect(patient);
                      }}
                    >
                      {patient.firstName} {patient.lastName}{' '}
                      <span className="ml-2 text-xs text-muted-foreground">({patient.email})</span>
                      {selected?.id === patient.id && <Check className="ml-auto h-4 w-4" />}
                    </CommandItem>
                  ))}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function LabAppointment() {
  const { id: labId } = useParams<{ id: string }>();
  const { data: lab, isLoading: labLoading } = api.labs.getLabById.useQuery({ placeId: labId }) as { data: Lab | undefined, isLoading: boolean };
  const { data: tests = [], isLoading: testsLoading } = api.labs.getLabTestsByLabId.useQuery({ labId }) as { data: LabTestAvailable[], isLoading: boolean };
  const { data: availability = [], isLoading: availLoading } = api.labs.getLabAvailabilityByLabId.useQuery({ labId });
  const { data: currentUser } = api.users.currentUser.useQuery();
  const { data: currentPatient } = api.patients.getCurrentPatient.useQuery();
  const { toast } = useToast();
  const router = useRouter();

  const bookLabAppointment = api.labs.bookLabAppointment.useMutation();

  const availableTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const form = useForm<z.infer<typeof labAppointmentSchema>>({
    resolver: zodResolver(labAppointmentSchema),
    defaultValues: {
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      phone: currentUser?.phone || "",
      email: currentUser?.email || "",
    },
  });

  const [confirmation, setConfirmation] = useState<null | any>(null);

  const isDoctor = currentUser?.role === 'doctor';
  const isPatient = currentUser?.role === 'patient';

  useEffect(() => {
    if (isDoctor && selectedPatient) {
      form.setValue('firstName', selectedPatient.firstName || '');
      form.setValue('lastName', selectedPatient.lastName || '');
      form.setValue('email', selectedPatient.email || '');
      form.setValue('phone', selectedPatient.phone || '');
      if (selectedPatient.dob) {
        const dobDate = new Date(selectedPatient.dob as string);
        const formattedDob = dobDate.toISOString().split('T')[0];
        if (formattedDob) {
          form.setValue('dob', formattedDob);
        }
      }
    }
  }, [isDoctor, selectedPatient, form]);

  // Populate patient info (including DOB) for logged-in patients
  useEffect(() => {
    if (isPatient && currentPatient) {
      if (currentPatient.firstName) form.setValue('firstName', currentPatient.firstName);
      if (currentPatient.lastName) form.setValue('lastName', currentPatient.lastName);
      if (currentPatient.email) form.setValue('email', currentPatient.email);
      if (currentPatient.phone) form.setValue('phone', currentPatient.phone);
      if (currentPatient.dob) form.setValue('dob', currentPatient.dob);
    }
  }, [isPatient, currentPatient, form]);

  const onSubmit = async (data: z.infer<typeof labAppointmentSchema>) => {
    try {
      const patientId = isDoctor ? selectedPatient?.id : currentUser?.id;
      if (isDoctor && !selectedPatient) {
        toast({ title: 'Select a patient', description: 'Please select a patient before booking.', variant: 'destructive' });
        return;
      }
      await bookLabAppointment.mutateAsync({ ...data, labId, patientId });
      setConfirmation({ ...data, lab });
      toast({ title: 'Appointment booked!', description: 'Your lab appointment has been scheduled.' });
    } catch (e) {
      toast({ title: 'Booking failed', description: 'Could not book appointment. Please try again.', variant: 'destructive' });
    }
  };

  if (labLoading || testsLoading || availLoading) {
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin" /></div>;
  }
  if (!lab) return <div>Lab not found.</div>;

  return (
    <main className="container mx-auto mb-48 mt-12 flex min-h-screen w-full flex-col gap-12">
      <LabCard lab={lab} />
      {confirmation ? (
        <Card className="p-8 text-center">
          <CardTitle>Appointment Confirmed!</CardTitle>
          <CardContent>
            <p>Your appointment for {tests.find(t => (t.testId || t.id) === (confirmation as any).testId)?.test?.name || 'the selected test'} at {lab.name} is booked for {(confirmation as any).date} at {(confirmation as any).time}.</p>
            <Button className="mt-6" onClick={() => router.push("/laboratories")}>Back to Laboratories</Button>
          </CardContent>
        </Card>
      ) : (
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
            <TestAndTimeSelection tests={tests} availableTimes={availableTimes} />
            {isDoctor && <PatientSearch onSelect={setSelectedPatient} />}
            <PatientInformation disabled={isPatient || isDoctor} />
            <NotesForLab />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Booking..." : "Book Appointment"}
            </Button>
          </form>
        </FormProvider>
      )}
    </main>
  );
}