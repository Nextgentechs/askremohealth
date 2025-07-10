'use client'

import { Badge } from '@web/components/ui/badge'
import { Button } from '@web/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card'
import { Checkbox } from '@web/components/ui/checkbox'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@web/components/ui/tabs'
import {
  Check,
  DollarSign,
  Minus,
  Plus,
  Search,
  TestTube,
  Truck,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import Link from 'next/link'

// Types
export interface Test {
  id: string
  loincTestId?: string
  name: string
  generalCategory?: string
  specificCategory?: string
  sampleType?: string
}

export interface LabTestAvailable {
  testId: string
  amount: number
  collection: CollectionMethod
}

export type CollectionMethod =
  | 'in-person'
  | 'home-collection'
  | 'mail-in'
  | 'walk-in'

export const collectionMethodLabels: Record<CollectionMethod, string> = {
  'in-person': 'In-Person Visit',
  'home-collection': 'Home Collection',
  'mail-in': 'Mail-In Sample',
  'walk-in': 'Walk-In Service',
}

// Mock test data
const mockTests: Test[] = [
  // Blood Chemistry
  {
    id: '1',
    loincTestId: '2093-3',
    name: 'Cholesterol, Total',
    generalCategory: 'Blood Chemistry',
    specificCategory: 'Lipid Panel',
    sampleType: 'Serum',
  },
  {
    id: '2',
    loincTestId: '2085-9',
    name: 'HDL Cholesterol',
    generalCategory: 'Blood Chemistry',
    specificCategory: 'Lipid Panel',
    sampleType: 'Serum',
  },
  {
    id: '3',
    loincTestId: '2089-1',
    name: 'LDL Cholesterol',
    generalCategory: 'Blood Chemistry',
    specificCategory: 'Lipid Panel',
    sampleType: 'Serum',
  },
  {
    id: '4',
    loincTestId: '2571-8',
    name: 'Triglycerides',
    generalCategory: 'Blood Chemistry',
    specificCategory: 'Lipid Panel',
    sampleType: 'Serum',
  },
  {
    id: '5',
    loincTestId: '33747-0',
    name: 'Hemoglobin A1c',
    generalCategory: 'Blood Chemistry',
    specificCategory: 'Diabetes Monitoring',
    sampleType: 'Whole Blood',
  },
  {
    id: '6',
    loincTestId: '2345-7',
    name: 'Glucose, Fasting',
    generalCategory: 'Blood Chemistry',
    specificCategory: 'Diabetes Monitoring',
    sampleType: 'Serum',
  },

  // Hematology
  {
    id: '7',
    loincTestId: '6690-2',
    name: 'Complete Blood Count (CBC)',
    generalCategory: 'Hematology',
    specificCategory: 'Blood Count',
    sampleType: 'Whole Blood',
  },
  {
    id: '8',
    loincTestId: '718-7',
    name: 'Hemoglobin',
    generalCategory: 'Hematology',
    specificCategory: 'Blood Count',
    sampleType: 'Whole Blood',
  },
  {
    id: '9',
    loincTestId: '4544-3',
    name: 'Hematocrit',
    generalCategory: 'Hematology',
    specificCategory: 'Blood Count',
    sampleType: 'Whole Blood',
  },

  // Immunology
  {
    id: '10',
    loincTestId: '22314-9',
    name: 'Hepatitis B Surface Antigen',
    generalCategory: 'Immunology',
    specificCategory: 'Infectious Disease',
    sampleType: 'Serum',
  },
  {
    id: '11',
    loincTestId: '16128-1',
    name: 'Hepatitis C Antibody',
    generalCategory: 'Immunology',
    specificCategory: 'Infectious Disease',
    sampleType: 'Serum',
  },
  {
    id: '12',
    loincTestId: '7905-3',
    name: 'HIV 1+2 Antibody',
    generalCategory: 'Immunology',
    specificCategory: 'Infectious Disease',
    sampleType: 'Serum',
  },

  // Microbiology
  {
    id: '13',
    loincTestId: '87449-6',
    name: 'Strep Throat Culture',
    generalCategory: 'Microbiology',
    specificCategory: 'Bacterial Culture',
    sampleType: 'Throat Swab',
  },
  {
    id: '14',
    loincTestId: '87086-8',
    name: 'Urine Culture',
    generalCategory: 'Microbiology',
    specificCategory: 'Bacterial Culture',
    sampleType: 'Urine',
  },

  // Endocrinology
  {
    id: '15',
    loincTestId: '3016-3',
    name: 'Thyroid Stimulating Hormone (TSH)',
    generalCategory: 'Endocrinology',
    specificCategory: 'Thyroid Function',
    sampleType: 'Serum',
  },
  {
    id: '16',
    loincTestId: '3024-7',
    name: 'Free T4',
    generalCategory: 'Endocrinology',
    specificCategory: 'Thyroid Function',
    sampleType: 'Serum',
  },
  {
    id: '17',
    loincTestId: '2986-8',
    name: 'Testosterone, Total',
    generalCategory: 'Endocrinology',
    specificCategory: 'Hormone Panel',
    sampleType: 'Serum',
  },
]

export default function TestDetailsForm() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTests, setSelectedTests] = useState<
    Map<string, LabTestAvailable>
  >(new Map())

  // Group tests by category
  const testsByCategory = useMemo(() => {
    const grouped = mockTests.reduce(
      (acc, test) => {
        const category = test.generalCategory ?? 'Other'
        acc[category] ??= []
        acc[category].push(test)
        return acc
      },
      {} as Record<string, Test[]>,
    )

    return grouped
  }, [])

  // Filter tests based on search and category
  const filteredTests = useMemo(() => {
    let tests = mockTests

    if (searchTerm) {
      tests = tests.filter(
        (test) =>
          (test.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
          (test.generalCategory?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
          (test.specificCategory?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
          (test.sampleType?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== 'all') {
      tests = tests.filter((test) => test.generalCategory === selectedCategory)
    }

    return tests
  }, [searchTerm, selectedCategory])

  const categories = Object.keys(testsByCategory)

  const handleTestToggle = (test: Test) => {
    const newSelected = new Map(selectedTests)

    if (newSelected.has(test.id)) {
      newSelected.delete(test.id)
    } else {
      newSelected.set(test.id, {
        testId: test.id,
        amount: 50, // Default price
        collection: 'in-person', // Default collection method
      })
    }

    setSelectedTests(newSelected)
  }

  const handleTestConfigUpdate = (
    testId: string,
    field: keyof LabTestAvailable,
    value: string | number | boolean,
  ) => {
    const newSelected = new Map(selectedTests)
    const existing = newSelected.get(testId)

    if (existing) {
      newSelected.set(testId, {
        ...existing,
        [field]: value,
      })
      setSelectedTests(newSelected)
    }
  }

  const handleBulkSelect = (tests: Test[]) => {
    const newSelected = new Map(selectedTests)

    tests.forEach((test) => {
      if (!newSelected.has(test.id)) {
        newSelected.set(test.id, {
          testId: test.id,
          amount: 50,
          collection: 'in-person',
        })
      }
    })

    setSelectedTests(newSelected)
  }

  const selectedCount = selectedTests.size

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <TestTube className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">
            Select Your Lab Tests
          </h1>
          <p className="text-lg text-gray-600">
            Choose the tests your lab offers and configure pricing
          </p>
          {selectedCount > 0 && (
            <Badge
              variant="secondary"
              className="mt-2 text-primary bg-secondary"
            >
              {selectedCount} test{selectedCount !== 1 ? 's' : ''} selected
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters and Selected Tests */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Tests</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleBulkSelect(testsByCategory[category] ?? [])
                    }
                    className="w-full justify-start text-xs"
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Add All {category}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="browse" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="browse">
                  Browse Tests ({filteredTests.length})
                </TabsTrigger>
                <TabsTrigger value="selected">
                  Selected Tests ({selectedCount})
                </TabsTrigger>
              </TabsList>

              {/* Browse Tests Tab */}
              <TabsContent value="browse" className="space-y-4">
                <div className="grid gap-4">
                  {categories.map((category) => {
                    const categoryTests = filteredTests.filter(
                      (test) => test.generalCategory === category,
                    )
                    if (categoryTests.length === 0) return null

                    return (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl text-primary">
                              {category}
                            </CardTitle>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBulkSelect(categoryTests)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add All
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-3">
                            {categoryTests.map((test) => (
                              <div
                                key={test.id}
                                className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                                  selectedTests.has(test.id)
                                    ? 'border-primary bg-secondary/50'
                                    : 'border-gray-200 hover:border-primary/50'
                                }`}
                                onClick={() => handleTestToggle(test)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-3">
                                    <Checkbox
                                      checked={selectedTests.has(test.id)}
                                      onChange={() => handleTestToggle(test)}
                                      className="mt-1"
                                    />
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900">
                                        {test.name}
                                      </h4>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {test.specificCategory && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {test.specificCategory}
                                          </Badge>
                                        )}
                                        {test.sampleType && (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {test.sampleType}
                                          </Badge>
                                        )}
                                        {test.loincTestId && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            LOINC: {test.loincTestId}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {selectedTests.has(test.id) && (
                                    <Check className="w-5 h-5 text-primary" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              {/* Selected Tests Tab */}
              <TabsContent value="selected" className="space-y-4">
                {selectedCount === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No tests selected
                      </h3>
                      <p className="text-gray-500">
                        Browse tests and select the ones your lab offers
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {Array.from(selectedTests.entries()).map(
                      ([testId, config]) => {
                        const test = mockTests.find((t) => t.id === testId)
                        if (!test) return null

                        return (
                          <Card key={testId}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="font-semibold text-lg">
                                    {test.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {test.generalCategory} • {test.sampleType}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTestToggle(test)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`amount-${testId}`}>
                                    Price ($)
                                  </Label>
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                      id={`amount-${testId}`}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={config.amount}
                                      onChange={(e) =>
                                        handleTestConfigUpdate(
                                          testId,
                                          'amount',
                                          Number.parseFloat(e.target.value) ?? 0,
                                        )
                                      }
                                      className="pl-10"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`collection-${testId}`}>
                                    Collection Method
                                  </Label>
                                  <Select
                                    value={config.collection}
                                    onValueChange={(value: CollectionMethod) =>
                                      handleTestConfigUpdate(
                                        testId,
                                        'collection',
                                        value,
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(
                                        collectionMethodLabels,
                                      ).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                          <div className="flex items-center">
                                            <Truck className="w-4 h-4 mr-2" />
                                            {label}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      },
                    )}

                    <div className="flex justify-end pt-6">
                      <Link href="/lab/onboarding/availability-details">
                        <Button className="px-8 py-3 bg-primary hover:bg-primary/90">
                          Save Test Configuration ({selectedCount} tests)
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
