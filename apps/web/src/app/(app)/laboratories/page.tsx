'use client'

import Footer from '@web/components/footer'
import { Badge } from '@web/components/ui/badge'
import { Button } from '@web/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card'
import { Input } from '@web/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web/components/ui/select'
import { Skeleton } from '@web/components/ui/skeleton'
import { KENYA_COUNTIES } from '@web/server/data/kenya-counties'
import { api } from '@web/trpc/react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FlaskConical,
  Globe,
  MapPin,
  Phone,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export default function LaboratoriesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const county = searchParams.get('county') ?? ''
  const page = Number(searchParams.get('page') ?? '1')

  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
      if (!updates.page) {
        params.set('page', '1')
      }
      router.push(`/laboratories?${params.toString()}`)
    },
    [searchParams, router],
  )

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateSearchParams({ search: value || undefined })
  }, 300)

  const { data, isLoading } = api.facilities.listFacilities.useQuery({
    type: 'laboratory',
    county: county || undefined,
    search: searchParams.get('search') ?? undefined,
    page,
    pageSize: 12,
  })

  const handleCountyChange = (value: string) => {
    updateSearchParams({ county: value === 'all' ? undefined : value })
  }

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: String(newPage) })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0D9488] to-[#14B8A6] py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <FlaskConical className="mb-4 h-16 w-16" />
            <h1 className="mb-4 text-4xl font-bold">
              Find Diagnostic Laboratories
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-white/80">
              Discover accredited diagnostic labs across Kenya. Get reliable
              test results from trusted laboratories near you.
            </p>

            {/* Search Bar */}
            <div className="flex w-full max-w-2xl flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search laboratories by name or address..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    debouncedSearch(e.target.value)
                  }}
                  className="h-12 bg-white pl-10 text-foreground"
                />
              </div>
              <Select
                value={county || 'all'}
                onValueChange={handleCountyChange}
              >
                <SelectTrigger className="h-12 w-full bg-white text-foreground sm:w-[200px]">
                  <SelectValue placeholder="Select County" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Counties</SelectItem>
                  {KENYA_COUNTIES.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              {isLoading ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                <>
                  {data?.pagination.total ?? 0} Laborator
                  {data?.pagination.total !== 1 ? 'ies' : 'y'} Found
                </>
              )}
            </h2>
            {(search || county) && (
              <p className="text-muted-foreground">
                {search && `Searching for "${search}"`}
                {search && county && ' in '}
                {county && `${county} County`}
              </p>
            )}
          </div>
        </div>

        {/* Labs Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.facilities.length === 0 ? (
          <Card className="py-16 text-center">
            <CardContent>
              <FlaskConical className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">
                No Laboratories Found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or browse all laboratories.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch('')
                  router.push('/laboratories')
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.facilities.map((facility) => (
              <Card
                key={facility.placeId}
                className="group overflow-hidden transition-all hover:shadow-lg"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2 text-lg group-hover:text-teal-600">
                        {facility.name}
                      </CardTitle>
                      <div className="mt-1 flex items-center gap-2">
                        {facility.verified && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="border-teal-200 text-teal-700"
                        >
                          Laboratory
                        </Badge>
                      </div>
                    </div>
                    <FlaskConical className="h-10 w-10 text-teal-500/20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="line-clamp-2">{facility.address}</span>
                  </div>

                  {facility.county && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>
                        {facility.town && `${facility.town}, `}
                        {facility.county} County
                      </span>
                    </div>
                  )}

                  {facility.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <a
                        href={`tel:${facility.phone}`}
                        className="hover:text-teal-600 hover:underline"
                      >
                        {facility.phone}
                      </a>
                    </div>
                  )}

                  {facility.website && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4 shrink-0" />
                      <a
                        href={facility.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="line-clamp-1 hover:text-teal-600 hover:underline"
                      >
                        {facility.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>Results typically in 24-48 hours</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      asChild
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                      size="sm"
                    >
                      <Link href={`/laboratories/${facility.placeId}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.name + ' ' + facility.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Directions
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from(
                { length: data.pagination.totalPages },
                (_, i) => i + 1,
              )
                .filter(
                  (p) =>
                    p === 1 ||
                    p === data.pagination.totalPages ||
                    Math.abs(p - page) <= 1,
                )
                .map((p, i, arr) => (
                  <span key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </Button>
                  </span>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
