'use client'

import { Button } from '@web/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card'
import { Input } from '@web/components/ui/input'
import { Label } from '@web/components/ui/label'
import { api } from '@web/trpc/react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  ListFilter,
  Minus,
  Plus,
  Search,
  X,
} from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

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
  collection: string
}

interface StoredLabTest {
  id: string
  labId: string
  testId: string
  amount: number
  collection: 'onsite' | 'home' | 'both'
  createdAt: Date
  updatedAt: Date | null
}

export default function TestDetailsForm() {
  // State for filters, pagination, and selection
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [currentCategoryPage, setCurrentCategoryPage] = useState(0)
  const [testPageByCategory, setTestPageByCategory] = useState<
    Record<string, number>
  >({})
  const [selectedTests, setSelectedTests] = useState<
    Map<string, LabTestAvailable>
  >(new Map())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  )
  const [showFilters, setShowFilters] = useState(false) // <-- Toggle for filters
  const router = useRouter();

  // Fetch tests from backend
  const { data: tests = [], isLoading } = api.tests.listTests.useQuery();

  // Fetch already stored lab tests for this lab
  const { data: storedLabTests = [] } = api.labs.getLabTestsForCurrentLab.useQuery();

  // When storedLabTests loads, pre-populate selectedTests with them
  useEffect(() => {
    if (storedLabTests && storedLabTests.length > 0) {
      setSelectedTests(
        new Map(
          storedLabTests.map((t: StoredLabTest) => [
            t.testId,
            {
              testId: t.testId,
              amount: t.amount,
              collection: t.collection,
            },
          ])
        )
      );
    }
  }, [storedLabTests]);

  // Normalize tests: convert nulls to undefined for optional fields
  const normalizedTests = useMemo(
    () =>
      tests.map((test) => ({
        ...test,
        loincTestId: test.loincTestId ?? undefined,
        specificCategory: test.specificCategory ?? undefined,
        sampleType: test.sampleType ?? undefined,
        generalCategory: test.generalCategory ?? undefined,
      })),
    [tests],
  )

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms debounce

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  // Group tests by generalCategory
  const testsByCategory = useMemo(() => {
    const term = debouncedSearchTerm.toLowerCase()
    const filtered = normalizedTests.filter((test) => {
      return (
        (test.name?.toLowerCase() ?? '').includes(term) ||
        (test.generalCategory?.toLowerCase() ?? '').includes(term) ||
        (test.specificCategory?.toLowerCase() ?? '').includes(term) ||
        (test.sampleType?.toLowerCase() ?? '').includes(term) ||
        (test.loincTestId?.toLowerCase() ?? '').includes(term)
      )
    })
    return filtered.reduce(
      (acc, test) => {
        const category = test.generalCategory ?? 'Other'
        acc[category] ??= []
        acc[category].push(test)
        return acc
      },
      {} as Record<string, Test[]>,
    )
  }, [normalizedTests, debouncedSearchTerm])

  // List of all categories
  const allCategories = useMemo(
    () => Object.keys(testsByCategory),
    [testsByCategory],
  )

  // Pagination logic for categories
  const categoriesPerPage = 3 // Example: 3 category cards per page
  const categoryPageCount = Math.ceil(allCategories.length / categoriesPerPage)
  const categoriesToShow = allCategories.slice(
    currentCategoryPage * categoriesPerPage,
    (currentCategoryPage + 1) * categoriesPerPage,
  )

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleCategoryPageChange = (page: number) => {
    setCurrentCategoryPage(page)
  }

  const handleTestPageChange = (category: string, page: number) => {
    setTestPageByCategory((prev) => ({ ...prev, [category]: page }))
  }

  const handleSelectTest = (test: Test) => {
    setSelectedTests((prev) => {
      const newSelection = new Map(prev);
      if (newSelection.has(test.id)) {
        newSelection.delete(test.id);
      } else {
        // Set a valid default collection value
        newSelection.set(test.id, {
          testId: test.id,
          amount: 0,
          collection: 'onsite', // <-- use a valid value
        });
      }
      return newSelection;
    })
  }

  const handleQuickAddCategory = (category: string) => {
    setSelectedTests((prev) => {
      const newSelection = new Map(prev);
      const testsInCat = testsByCategory[category] ?? [];
      testsInCat.forEach((test) => {
        if (!newSelection.has(test.id)) {
          newSelection.set(test.id, {
            testId: test.id,
            amount: 0,
            collection: 'onsite', // <-- use a valid value
          });
        }
      });
      return newSelection;
    })
    setExpandedCategories((prev) => new Set(prev).add(category)) // Optionally expand category when quick-adding
  }

  const handleRemoveSelectedTest = (testId: string) => {
    setSelectedTests((prev) => {
      const newSelection = new Map(prev)
      newSelection.delete(testId)
      return newSelection
    })
  }

  const addLabTests = api.labs.addLabTests.useMutation({
    onSuccess: () => {
      router.push('/lab/onboarding/availability-details');
    },
  });

  const handleSubmit = async () => {
    const tests = Array.from(selectedTests.values());
    await addLabTests.mutateAsync({ tests });
  }

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories((prev) => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(category)) {
        newExpanded.delete(category)
      } else {
        newExpanded.add(category)
      }
      return newExpanded
    })
  }

  // Expand all categories by default on laptop/desktop screens on initial load
  useEffect(() => {
    // Only run on mount
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      // 1024px is Tailwind's 'lg'
      setExpandedCategories(new Set(allCategories))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCategories.length])

  // Track if screen is desktop (lg and up)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkDesktop = () =>
      setIsDesktop(typeof window !== 'undefined' && window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-lg font-semibold text-gray-700"
        >
          Loading tests...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50 p-4">
      {/* Page Title & Description */}
      <div className="w-full max-w-4xl lg:max-w-5xl mx-auto mb-8 px-2 lg:px-0 py-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary text-center mb-3 drop-shadow-sm">
          Select Lab Tests for Your Onboarding
        </h1>
        <div className="flex flex-col text-base sm:text-lg text-gray-700 text-center max-w-2xl mx-auto mb-2">
          <span>
            <span className="font-semibold text-primary">Step 1:</span> Use the{' '}
            <span className="font-semibold">Filters</span> to search or browse by category.
          </span>
          <span className="hidden sm:inline">&nbsp;</span>
          <span>
            <span className="font-semibold text-primary">Step 2:</span> Click{' '}
            <span className="font-semibold">Select</span> to add a test, or use{' '}
            <span className="font-semibold">Add all in [Category]</span> for quick selection.
          </span>
          <span className="hidden sm:inline">&nbsp;</span>
          <span>
            <span className="font-semibold text-primary">Step 3:</span> Review your selected tests in the sidebar, remove any if needed, and click{' '}
            <span className="font-semibold">Save Selected Tests</span> to continue.
          </span>
        </div>
      </div>

      {/* Toggle Filters Button */}
      <div className="w-full flex justify-center mb-6 lg:mb-4">
        <Button
          className="flex items-center gap-2 px-5 py-3 rounded-lg shadow bg-primary hover:bg-primary/90 text-white text-base font-semibold transition"
          onClick={() => setShowFilters((prev) => !prev)}
          aria-label="Toggle Filters and Selected Tests"
        >
          {showFilters ? <X size={22} /> : <ListFilter size={22} />}
          {showFilters
            ? 'Hide Filters & Selected Tests'
            : 'Show Filters & Selected Tests'}
        </Button>
      </div>

      {/* Sidebar / Drawer for Filters and Selected Tests */}
      <AnimatePresence>
        {showFilters &&
          (isDesktop ? (
            // Desktop: Modal popup
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
              style={{ backdropFilter: 'blur(2px)' }}
            >
              <div className="relative w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
                <Button
                  variant="ghost"
                  onClick={() => setShowFilters(false)}
                  aria-label="Close Filters"
                  className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                >
                  <X size={24} />
                </Button>
                <div className="space-y-6 mt-2">
                  {/* --- Filters, Quick Actions, Selected Tests --- */}
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg font-semibold text-gray-800">
                        <Search className="mr-2" size={20} /> Filters
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Label htmlFor="search" className="sr-only">
                        Search Tests
                      </Label>
                      <Input
                        id="search"
                        placeholder="Search by name, category..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="pl-8"
                      />
                    </CardContent>
                  </Card>
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {categoriesToShow.map((category) => (
                        <Button
                          key={category}
                          onClick={() => handleQuickAddCategory(category)}
                          className="w-full mb-2 bg-primary hover:bg-primary/90 text-white animate-fade-in text-sm py-2"
                        >
                          <Plus className="mr-2" size={16} /> Add all in{' '}
                          {category}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        Selected Tests ({selectedTests.size})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-64 overflow-y-auto custom-scrollbar">
                      {selectedTests.size === 0 ? (
                        <p className="text-gray-500 italic text-sm">
                          No tests selected yet.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-end mb-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setSelectedTests(new Map())}
                              className="text-white"
                              aria-label="Remove all selected tests"
                            >
                              <Minus size={16} className="mr-1" /> Remove All
                            </Button>
                          </div>
                          <AnimatePresence>
                            {Array.from(selectedTests.values()).map(
                              (selectedTest) => {
                                const test = normalizedTests.find(
                                  (t) => t.id === selectedTest.testId,
                                )
                                return (
                                  test && (
                                    <motion.div
                                      key={test.id}
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, x: -50 }}
                                      transition={{ duration: 0.2 }}
                                      className="flex items-center justify-between p-2 border rounded-md bg-gray-50 hover:bg-gray-100 text-sm"
                                    >
                                      <span className="font-medium text-gray-700">
                                        {test.name}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleRemoveSelectedTest(test.id)
                                        }
                                        className="text-red-500 hover:text-red-700 p-1"
                                        aria-label={`Remove ${test.name}`}
                                      >
                                        <Minus size={16} />
                                      </Button>
                                    </motion.div>
                                  )
                                )
                              },
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          ) : (
            // Mobile/tablet: Drawer/Sidebar
            <motion.aside
              initial={{ opacity: 0, x: '-100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 w-full max-w-xs bg-white p-4 shadow-xl z-40 overflow-y-auto"
            >
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowFilters(false)}
                  aria-label="Close Filters"
                >
                  <X size={24} className="text-gray-600 hover:text-gray-900" />
                </Button>
              </div>
              <div className="space-y-6">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg font-semibold text-gray-800">
                      <Search className="mr-2" size={20} /> Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label htmlFor="search" className="sr-only">
                      Search Tests
                    </Label>
                    <Input
                      id="search"
                      placeholder="Search by name, category..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="pl-8"
                    />
                  </CardContent>
                </Card>
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {categoriesToShow.map((category) => (
                      <Button
                        key={category}
                        onClick={() => handleQuickAddCategory(category)}
                        className="w-full mb-2 bg-primary hover:bg-primary/90 text-white animate-fade-in text-sm py-2"
                      >
                        <Plus className="mr-2" size={16} /> Add all in{' '}
                        {category}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      Selected Tests ({selectedTests.size})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-64 overflow-y-auto custom-scrollbar">
                    {selectedTests.size === 0 ? (
                      <p className="text-gray-500 italic text-sm">
                        No tests selected yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-end mb-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setSelectedTests(new Map())}
                            className="text-white"
                            aria-label="Remove all selected tests"
                          >
                            <Minus size={16} className="mr-1" /> Remove All
                          </Button>
                        </div>
                        <AnimatePresence>
                          {Array.from(selectedTests.values()).map(
                            (selectedTest) => {
                              const test = normalizedTests.find(
                                (t) => t.id === selectedTest.testId,
                              )
                              return (
                                test && (
                                  <motion.div
                                    key={test.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center justify-between p-2 border rounded-md bg-gray-50 hover:bg-gray-100 text-sm"
                                  >
                                    <span className="font-medium text-gray-700">
                                      {test.name}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveSelectedTest(test.id)
                                      }
                                      className="text-red-500 hover:text-red-700 p-1"
                                      aria-label={`Remove ${test.name}`}
                                    >
                                      <Minus size={16} />
                                    </Button>
                                  </motion.div>
                                )
                              )
                            },
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.aside>
          ))}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={`flex-1 ${showFilters && !isDesktop ? 'hidden lg:block' : ''}`}
      >
        {/* Category Pagination Controls (Top) */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <Button
            onClick={() => handleCategoryPageChange(currentCategoryPage - 1)}
            disabled={currentCategoryPage === 0}
            className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
          >
            Previous
          </Button>
          <span className="text-base sm:text-lg font-semibold text-gray-700 text-center">
            Category Page {currentCategoryPage + 1} of {categoryPageCount}
          </span>
          <Button
            onClick={() => handleCategoryPageChange(currentCategoryPage + 1)}
            disabled={currentCategoryPage === categoryPageCount - 1}
            className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
          >
            Next
          </Button>
        </div>

        {/* Category Cards (Paginated) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesToShow.length > 0 ? (
            categoriesToShow.map((category) => {
              const tests = testsByCategory[category] ?? []
              const testsPerPage = 5 // Example: 5 tests per card page
              const testPage = testPageByCategory[category] ?? 0
              const testPageCount = Math.ceil(tests.length / testsPerPage)
              const testsToShow = tests.slice(
                testPage * testsPerPage,
                (testPage + 1) * testsPerPage,
              )
              const isExpanded = expandedCategories.has(category)

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xl font-bold text-gray-800">
                        {category}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategoryExpansion(category)}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        aria-label={
                          isExpanded
                            ? `Collapse ${category}`
                            : `Expand ${category}`
                        }
                      >
                        {isExpanded ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent className="flex-1 pt-0">
                      <motion.div
                        initial={false}
                        animate={{ height: isExpanded ? 'auto' : 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <Button
                          size="sm"
                          onClick={() => handleQuickAddCategory(category)}
                          className="w-full mb-4 bg-secondary-foreground hover:bg-secondary-foreground/90 text-white text-sm py-2"
                        >
                          <Plus className="mr-2" size={14} /> Add all in{' '}
                          {category}
                        </Button>
                        {/* Test List (Paginated) */}
                        <div className="space-y-3">
                          {testsToShow.length > 0 ? (
                            testsToShow.map((test) => {
                              const isSelected = selectedTests.has(test.id)
                              return (
                                <motion.div
                                  key={test.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className={`border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between 
                                              transition-all duration-200 ease-in-out text-sm ${
                                                isSelected
                                                  ? 'bg-blue-50 border-blue-200'
                                                  : 'bg-white hover:bg-gray-50'
                                              }`}
                                >
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900">
                                      {test.name}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      <span className="font-medium">
                                        Specific Category:
                                      </span>{' '}
                                      {test.specificCategory ?? 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      <span className="font-medium">
                                        Sample Type:
                                      </span>{' '}
                                      {test.sampleType ?? 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      <span className="font-medium">
                                        LOINC:
                                      </span>{' '}
                                      {test.loincTestId ?? 'N/A'}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSelectTest(test)}
                                    className={`mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 ${
                                      isSelected
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                                  >
                                    {isSelected ? (
                                      <>
                                        <Minus size={16} className="mr-1" />{' '}
                                        Remove
                                      </>
                                    ) : (
                                      <>
                                        <Plus size={16} className="mr-1" />{' '}
                                        Select
                                      </>
                                    )}
                                  </Button>
                                </motion.div>
                              )
                            })
                          ) : (
                            <p className="text-gray-500 italic text-sm">
                              No tests found in this category.
                            </p>
                          )}
                        </div>
                        {/* Test Pagination Controls */}
                        {testPageCount > 1 && (
                          <div className="flex justify-between items-center mt-4">
                            <Button
                              size="sm"
                              disabled={testPage === 0}
                              onClick={() =>
                                handleTestPageChange(category, testPage - 1)
                              }
                              className="bg-primary hover:bg-primary/90 text-white text-xs py-1"
                            >
                              Previous
                            </Button>
                            <span className="text-xs text-gray-700">
                              Page {testPage + 1} of {testPageCount}
                            </span>
                            <Button
                              size="sm"
                              disabled={testPage === testPageCount - 1}
                              onClick={() =>
                                handleTestPageChange(category, testPage + 1)
                              }
                              className="bg-primary hover:bg-primary/90 text-white text-xs py-1"
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          ) : (
            <div className="col-span-full text-center text-gray-600 text-lg">
              No categories or tests found matching your search.
            </div>
          )}
        </div>

        {/* Category Pagination Controls (Bottom) */}

        {/* Submit Button */}
        <div className="flex justify-center mt-8 pb-16 lg:pb-4">
          <Button
            size="lg"
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white shadow-lg w-full sm:w-auto px-8 py-3 text-lg flex items-center justify-center"
            disabled={addLabTests.status === 'pending'}
          >
            {addLabTests.status === 'pending' ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>Save Selected Tests ({selectedTests.size})</>
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
