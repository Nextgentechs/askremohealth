'use client'

import React, { useState, useMemo } from 'react';
import { Button } from '@web/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@web/components/ui/card';
import { Input } from '@web/components/ui/input';
import { Label } from '@web/components/ui/label';
import { api } from '@web/trpc/react';

// Types
export interface Test {
  id: string;
  loincTestId?: string;
  name: string;
  generalCategory?: string;
  specificCategory?: string;
  sampleType?: string;
}

export interface LabTestAvailable {
  testId: string;
  amount: number;
  collection: string;
}

export default function TestDetailsForm() {
  // Fetch tests from backend
  const { data: tests = [], isLoading } = api.tests.listTests.useQuery();

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
    [tests]
  );

  // State for filters, pagination, and selection
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCategoryPage, setCurrentCategoryPage] = useState(0);
  const [testPageByCategory, setTestPageByCategory] = useState<Record<string, number>>({});
  const [selectedTests, setSelectedTests] = useState<Map<string, LabTestAvailable>>(new Map());

  // Group tests by generalCategory
  const testsByCategory = useMemo(() => {
    // Filter by search term
    const filtered = normalizedTests.filter((test) => {
      const term = searchTerm.toLowerCase();
      return (
        (test.name?.toLowerCase() ?? '').includes(term) ||
        (test.generalCategory?.toLowerCase() ?? '').includes(term) ||
        (test.specificCategory?.toLowerCase() ?? '').includes(term) ||
        (test.sampleType?.toLowerCase() ?? '').includes(term) ||
        (test.loincTestId?.toLowerCase() ?? '').includes(term)
      );
    });
    // Group by generalCategory
    return filtered.reduce((acc, test) => {
      const category = test.generalCategory ?? 'Other';
      acc[category] ??= [];
      acc[category].push(test);
      return acc;
    }, {} as Record<string, Test[]>);
  }, [normalizedTests, searchTerm]);

  // List of all categories
  const allCategories = useMemo(() => Object.keys(testsByCategory), [testsByCategory]);

  // Pagination logic for categories
  const categoriesPerPage = 3; // Example: 3 category cards per page
  const categoryPageCount = Math.ceil(allCategories.length / categoriesPerPage);
  const categoriesToShow = allCategories.slice(
    currentCategoryPage * categoriesPerPage,
    (currentCategoryPage + 1) * categoriesPerPage
  );

  // Handler skeletons
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // TODO: Filter logic
  };

  const handleCategoryPageChange = (page: number) => {
    setCurrentCategoryPage(page);
  };

  const handleTestPageChange = (category: string, page: number) => {
    setTestPageByCategory((prev) => ({ ...prev, [category]: page }));
  };

  const handleSelectTest = (_test: Test) => {
    // TODO: Add/remove test from selectedTests
  };

  const handleQuickAddCategory = (_category: string) => {
    // TODO: Add all tests in this category to selectedTests
  };

  const handleSubmit = () => {
    // TODO: Submit selectedTests to backend
  };

  // Loading state
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading tests...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50 p-4">
      {/* Sidebar */}
      <aside className="w-full max-w-xs mr-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="search">Search Tests</Label>
            <Input
              id="search"
              placeholder="Search by name, category..."
              value={searchTerm}
              onChange={handleSearch}
            />
            {/* TODO: Add more filters if needed */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Quick add buttons for each visible category */}
            {categoriesToShow.map((category) => (
              <Button key={category} onClick={() => handleQuickAddCategory(category)} className="w-full mb-2">
                Add all in {category}
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Selected Tests</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: List selected tests, allow removal */}
            <div className="space-y-2">
              {/* Example: */}
              {/* Array.from(selectedTests.values()).map(test => <div key={test.testId}>{test.testId}</div>) */}
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Category Pagination Controls */}
        <div className="flex justify-between items-center mb-4">
          <Button disabled={currentCategoryPage === 0} onClick={() => handleCategoryPageChange(currentCategoryPage - 1)}>
            Previous
          </Button>
          <span>
            Page {currentCategoryPage + 1} of {categoryPageCount}
          </span>
          <Button disabled={currentCategoryPage === categoryPageCount - 1} onClick={() => handleCategoryPageChange(currentCategoryPage + 1)}>
            Next
          </Button>
        </div>

        {/* Category Cards (Paginated) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesToShow.map((category) => {
            // Pagination for tests in this category
            const tests = testsByCategory[category] ?? [];
            const testsPerPage = 5; // Example: 5 tests per card page
            const testPage = testPageByCategory[category] ?? 0;
            const testPageCount = Math.ceil(tests.length / testsPerPage);
            const testsToShow = tests.slice(testPage * testsPerPage, (testPage + 1) * testsPerPage);
            return (
              <Card key={category} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                  {/* Quick add for this category */}
                  <Button size="sm" onClick={() => handleQuickAddCategory(category)}>
                    Add all in {category}
                  </Button>
                </CardHeader>
                <CardContent className="flex-1">
                  {/* Test List (Paginated) */}
                  <div className="space-y-4">
                    {testsToShow.map((test) => (
                      <div key={test.id} className="border rounded p-2 flex flex-col">
                        <div className="font-semibold">{test.name}</div>
                        <div className="text-sm text-gray-600">Specific Category: {test.specificCategory}</div>
                        <div className="text-sm text-gray-600">Sample Type: {test.sampleType}</div>
                        <div className="text-xs text-gray-400">LOINC: {test.loincTestId}</div>
                        {/* TODO: Add select/add button, price, collection method */}
                        <Button size="sm" onClick={() => handleSelectTest(test)}>
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                  {/* Test Pagination Controls */}
                  <div className="flex justify-between items-center mt-4">
                    <Button size="sm" disabled={testPage === 0} onClick={() => handleTestPageChange(category, testPage - 1)}>
                      Previous
                    </Button>
                    <span>
                      Page {testPage + 1} of {testPageCount}
                    </span>
                    <Button size="sm" disabled={testPage === testPageCount - 1} onClick={() => handleTestPageChange(category, testPage + 1)}>
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Category Pagination Controls (again, for bottom) */}
        <div className="flex justify-between items-center mt-8">
          <Button disabled={currentCategoryPage === 0} onClick={() => handleCategoryPageChange(currentCategoryPage - 1)}>
            Previous
          </Button>
          <span>
            Page {currentCategoryPage + 1} of {categoryPageCount}
          </span>
          <Button disabled={currentCategoryPage === categoryPageCount - 1} onClick={() => handleCategoryPageChange(currentCategoryPage + 1)}>
            Next
          </Button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <Button size="lg" onClick={handleSubmit}>
            Save Selected Tests
          </Button>
        </div>
      </main>
    </div>
  );
}
