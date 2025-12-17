# Ask RemoHealth API Documentation

This document provides comprehensive documentation for all tRPC API endpoints available in the Ask RemoHealth platform.

## Overview

The API is built using [tRPC](https://trpc.io/) which provides end-to-end type safety between the client and server. All endpoints follow REST-like conventions and return JSON responses.

## Authentication

Most endpoints require authentication. The API uses session-based authentication with cookies.

- **Public endpoints**: Available without authentication
- **Protected endpoints**: Require a valid session (any authenticated user)
- **Doctor endpoints**: Require authentication and doctor role
- **Admin endpoints**: Require authentication and admin role

## Base URL

```
/api/trpc
```

---

## Routers

### Doctors Router (`doctors`)

Endpoints for managing doctor profiles and listings.

#### `doctors.list`

Get a paginated list of doctors with optional filters.

- **Type**: Query
- **Auth**: Public
- **Input**:
  ```typescript
  {
    page?: number;           // Page number (default: 1)
    pageSize?: number;       // Items per page (default: 10)
    specialty?: string;      // Filter by specialty ID
    location?: string;       // Filter by location/county
    search?: string;         // Search by name
  }
  ```
- **Output**: Array of doctor profiles with user info, specialty, ratings

#### `doctors.details`

Get detailed information about a specific doctor.

- **Type**: Query
- **Auth**: Public
- **Input**: `string` (doctor ID)
- **Output**: Full doctor profile including:
  - User information (name, email)
  - Specialty details
  - Facility/office locations
  - Operating hours
  - Certificates
  - Reviews and ratings
  - Booked appointment slots

#### `doctors.topRated`

Get top-rated doctors.

- **Type**: Query
- **Auth**: Public
- **Input**: `number` (limit, default: 5)
- **Output**: Array of doctors sorted by rating

---

### Patients Router (`patients`)

Endpoints for patient-related operations.

#### `patients.getProfile`

Get the current patient's profile.

- **Type**: Query
- **Auth**: Protected (Patient)
- **Output**: Patient profile with user information

---

### Appointments Router (via `doctors`)

#### `doctors.bookAppointment`

Book an appointment with a doctor.

- **Type**: Mutation
- **Auth**: Protected (Patient)
- **Input**:
  ```typescript
  {
    doctorId: string;
    appointmentDate: Date;
    type: 'online' | 'physical';
    patientNotes?: string;
  }
  ```
- **Output**: Created appointment object

---

### Prescriptions Router (`prescriptions`)

Endpoints for prescription management.

#### `prescriptions.create`

Create a new prescription for a patient.

- **Type**: Mutation
- **Auth**: Doctor only
- **Input**:
  ```typescript
  {
    appointmentId: string;
    patientId: string;
    diagnosis?: string;
    notes?: string;
    validUntil?: Date;
    items: Array<{
      medicationName: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity?: number;
      instructions?: string;
    }>;
  }
  ```
- **Output**: Created prescription object

#### `prescriptions.getById`

Get a prescription by ID.

- **Type**: Query
- **Auth**: Protected (owner doctor or patient)
- **Input**: `string` (prescription UUID)
- **Output**: Prescription with items, doctor, and patient info

#### `prescriptions.getMyPrescriptions`

Get all prescriptions for the current patient.

- **Type**: Query
- **Auth**: Protected (Patient)
- **Output**: Array of prescriptions with doctor info and items

#### `prescriptions.getDoctorPrescriptions`

Get all prescriptions created by the current doctor.

- **Type**: Query
- **Auth**: Doctor only
- **Output**: Array of prescriptions with patient info and items

#### `prescriptions.update`

Update a prescription's details or status.

- **Type**: Mutation
- **Auth**: Doctor only (owner)
- **Input**:
  ```typescript
  {
    id: string;
    diagnosis?: string;
    notes?: string;
    status?: 'active' | 'dispensed' | 'expired' | 'cancelled';
    validUntil?: Date;
  }
  ```

#### `prescriptions.cancel`

Cancel a prescription.

- **Type**: Mutation
- **Auth**: Doctor only (owner)
- **Input**: `string` (prescription UUID)

---

### Facilities Router (`facilities`)

Endpoints for managing healthcare facilities.

#### `facilities.listFacilities`

Get a paginated list of facilities with filters.

- **Type**: Query
- **Auth**: Public
- **Input**:
  ```typescript
  {
    type?: 'hospital' | 'laboratory' | 'pharmacy';
    county?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }
  ```
- **Output**:
  ```typescript
  {
    facilities: Array<Facility>
    pagination: {
      page: number
      pageSize: number
      total: number
      totalPages: number
    }
  }
  ```

#### `facilities.getById`

Get details of a specific facility.

- **Type**: Query
- **Auth**: Public
- **Input**: `string` (facility place ID)
- **Output**: Full facility details

---

### Specialties Router (`specialties`)

Endpoints for medical specialties.

#### `specialties.list`

Get all medical specialties.

- **Type**: Query
- **Auth**: Public
- **Output**: Array of specialties with icons

---

### Articles Router (`articles`)

Endpoints for health articles/blog posts.

#### `articles.list`

Get published articles.

- **Type**: Query
- **Auth**: Public
- **Input**:
  ```typescript
  {
    page?: number;
    pageSize?: number;
  }
  ```
- **Output**: Array of articles with images

#### `articles.getById`

Get a single article.

- **Type**: Query
- **Auth**: Public
- **Input**: `string` (article UUID)
- **Output**: Full article with content and images

---

### Notifications Router (`notifications`)

Endpoints for user notifications.

#### `notifications.list`

Get notifications for the current user.

- **Type**: Query
- **Auth**: Protected
- **Output**: Array of notifications sorted by date

#### `notifications.markAsRead`

Mark a notification as read.

- **Type**: Mutation
- **Auth**: Protected
- **Input**: `string` (notification ID)

#### `notifications.markAllAsRead`

Mark all notifications as read.

- **Type**: Mutation
- **Auth**: Protected

---

### Reviews Router (`reviews`)

Endpoints for doctor reviews.

#### `reviews.create`

Create a review for a doctor after an appointment.

- **Type**: Mutation
- **Auth**: Protected (Patient)
- **Input**:
  ```typescript
  {
    appointmentId: string;
    doctorId: string;
    rating: number;      // 1-5
    comment?: string;
  }
  ```

#### `reviews.getByDoctor`

Get all reviews for a doctor.

- **Type**: Query
- **Auth**: Public
- **Input**: `string` (doctor ID)
- **Output**: Array of reviews with patient names

---

### Video Router (`video`)

Endpoints for video consultations.

#### `video.getToken`

Get a video room token for an appointment.

- **Type**: Query
- **Auth**: Protected (appointment participant)
- **Input**: `string` (appointment ID)
- **Output**: Video room token and credentials

---

### Admin Router (`admin`)

Administrative endpoints (requires admin role).

#### `admin.getDashboardStats`

Get platform statistics.

- **Type**: Query
- **Auth**: Admin only
- **Output**: User counts, appointment stats, revenue metrics

#### `admin.listUsers`

Get all users with pagination.

- **Type**: Query
- **Auth**: Admin only

#### `admin.verifyDoctor`

Verify a doctor's registration.

- **Type**: Mutation
- **Auth**: Admin only
- **Input**: `{ doctorId: string; status: 'verified' | 'rejected' }`

---

## Error Handling

All endpoints return errors in the following format:

```typescript
{
  error: {
    code: string;          // TRPC error code
    message: string;       // Human-readable message
    data?: {
      zodError?: object;   // Validation errors
    };
  };
}
```

### Common Error Codes

| Code                    | Description                    |
| ----------------------- | ------------------------------ |
| `UNAUTHORIZED`          | Not logged in                  |
| `FORBIDDEN`             | Logged in but lacks permission |
| `NOT_FOUND`             | Resource doesn't exist         |
| `BAD_REQUEST`           | Invalid input                  |
| `INTERNAL_SERVER_ERROR` | Server error                   |

---

## Rate Limiting

API requests are rate-limited per IP address:

- **Public endpoints**: 100 requests/minute
- **Authenticated endpoints**: 300 requests/minute

---

## Examples

### Fetching Doctors (React Query)

```typescript
import { api } from '@web/trpc/react';

function DoctorList() {
  const { data, isLoading } = api.doctors.list.useQuery({
    specialty: 'cardiology',
    page: 1,
    pageSize: 10,
  });

  if (isLoading) return <Loading />;
  return <DoctorGrid doctors={data} />;
}
```

### Creating a Prescription (Server Action)

```typescript
import { api } from '@web/trpc/server'

async function createPrescription(appointmentId: string, patientId: string) {
  const prescription = await api.prescriptions.create({
    appointmentId,
    patientId,
    diagnosis: 'Common cold',
    items: [
      {
        medicationName: 'Paracetamol',
        dosage: '500mg',
        frequency: '3 times daily',
        duration: '5 days',
        quantity: 15,
        instructions: 'Take after meals',
      },
    ],
  })

  return prescription
}
```

---

## Changelog

### v0.1.0 (December 2024)

- Initial API documentation
- Documented all tRPC routers
- Added prescription management endpoints
- Added facilities filtering and pagination
