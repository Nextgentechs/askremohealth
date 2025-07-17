"use client"

import React from "react"
import { Input } from "@web/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card"
import { Badge } from "@web/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@web/components/ui/select"
import { Building2, Globe, MapPin, Phone, Search, X } from "lucide-react"
import { KENYA_COUNTIES } from "@web/server/data/kenya-counties"
import LabsList, { Lab } from "@web/components/labs-list"
import { api } from "@web/trpc/react"

export default function LabsSearchForm() {
  // State for search and filter
  const [searchName, setSearchName] = React.useState("")
  const [selectedCounty, setSelectedCounty] = React.useState<string>("all")

  // Fetch labs from API (replace with your actual TRPC/React Query hook)
  const { data: labs = [], isLoading } = api.labs.listLabs.useQuery()

  // Filtered labs
  const filteredLabs = React.useMemo(() => {
    return labs.filter((lab: any) => {
      const matchesName =
        !searchName || lab.name.toLowerCase().includes(searchName.toLowerCase())
      const matchesCounty =
        selectedCounty === "all" || lab.county === KENYA_COUNTIES.find(c => c.code === selectedCounty)?.name
      return matchesName && matchesCounty
    })
  }, [labs, searchName, selectedCounty])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name Search */}
          <div className="space-y-2">
            <label htmlFor="search-name" className="text-sm font-medium text-gray-700">
              Search by Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search-name"
                type="text"
                placeholder="Enter laboratory name..."
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                className="pl-10"
              />
              {searchName && (
                <X
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer"
                  onClick={() => setSearchName("")}
                />
              )}
            </div>
          </div>

          {/* County Filter */}
          <div className="space-y-2">
            <label htmlFor="county-filter" className="text-sm font-medium text-gray-700">
              Filter by County
            </label>
            <Select value={selectedCounty} onValueChange={setSelectedCounty}>
              <SelectTrigger id="county-filter">
                <SelectValue placeholder="Select county" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counties</SelectItem>
                {KENYA_COUNTIES.map((county) => (
                  <SelectItem key={county.code} value={county.code}>
                    {county.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Showing {filteredLabs.length} of {labs.length} laboratories
          </p>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <span className="text-gray-500">Loading laboratories...</span>
        </div>
      ) : filteredLabs.length > 0 ? (
        <LabsList labs={filteredLabs.map(lab => ({
          ...lab,
          phone: lab.phone ?? undefined,
          website: lab.website ?? undefined,
        }))} />
      ) : (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No laboratories found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters to find more results.</p>
        </div>
      )}
    </div>
  )
}