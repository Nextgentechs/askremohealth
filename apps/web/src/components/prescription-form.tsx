'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@web/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@web/components/ui/form'
import { Input } from '@web/components/ui/input'
import { Textarea } from '@web/components/ui/textarea'
import { useToast } from '@web/hooks/use-toast'
import { api } from '@web/trpc/react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

const medicationSchema = z.object({
  medicationName: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  quantity: z.coerce.number().int().positive().optional(),
  instructions: z.string().optional(),
})

const prescriptionFormSchema = z.object({
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  validUntil: z.string().optional(),
  items: z.array(medicationSchema).min(1, 'Add at least one medication'),
})

type PrescriptionFormData = z.infer<typeof prescriptionFormSchema>

interface PrescriptionFormProps {
  appointmentId: string
  patientId: string
  patientName: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function PrescriptionForm({
  appointmentId,
  patientId,
  patientName,
  onSuccess,
  onCancel,
}: PrescriptionFormProps) {
  const { toast } = useToast()

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      diagnosis: '',
      notes: '',
      validUntil: '',
      items: [
        {
          medicationName: '',
          dosage: '',
          frequency: '',
          duration: '',
          quantity: undefined,
          instructions: '',
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const createMutation = api.prescriptions.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Prescription Created',
        description: 'The prescription has been sent to the patient.',
      })
      form.reset()
      onSuccess?.()
    },
    onError: (error: { message: string }) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: PrescriptionFormData) => {
    createMutation.mutate({
      appointmentId,
      patientId,
      diagnosis: data.diagnosis,
      notes: data.notes,
      validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      items: data.items,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Prescription</CardTitle>
        <CardDescription>
          Prescribing for: <strong>{patientName}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Diagnosis */}
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter diagnosis..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Medications</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      medicationName: '',
                      dosage: '',
                      frequency: '',
                      duration: '',
                      quantity: undefined,
                      instructions: '',
                    })
                  }
                >
                  <Plus className="mr-2 size-4" />
                  Add Medication
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-medium">Medication {index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.medicationName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Amoxicillin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.dosage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosage *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 500mg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.frequency`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 3 times daily"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.duration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 7 days" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 21"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Number of units to dispense
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.instructions`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Take after meals"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              ))}
            </div>

            {/* Additional Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes for the patient or pharmacist..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valid Until */}
            <FormField
              control={form.control}
              name="validUntil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid Until</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    When this prescription expires (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Create Prescription
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
