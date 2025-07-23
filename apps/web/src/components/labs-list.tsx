"use client"

import { Building2, Globe, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import React from "react";
import { useRouter } from "next/navigation";

// Define the Lab type (adjust fields as needed)
export type Lab = {
  placeId: string;
  name: string;
  address: string;
  town?: string;
  county?: string;
  phone?: string;
  website?: string;
};

function EmptyLabs() {
  return (
    <Card className="flex h-64 w-full flex-col items-center justify-center gap-2 border-none shadow-none text-center">
      <Building2 className="size-12 text-muted-foreground/60" />
      <h3 className="font-medium">No labs found</h3>
      <p className="text-sm text-muted-foreground">Try adjusting your search filters</p>
    </Card>
  );
}

export default function LabsList({ labs }: { labs: Lab[] }) {
  const router = useRouter();
  if (!labs?.length) {
    return <EmptyLabs />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {labs.map((lab) => (
        <Card
          key={lab.placeId}
          className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-primary cursor-pointer"
          onClick={() => router.push(`/laboratories/${lab.placeId}`)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-primary flex items-start gap-2">
              <Building2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{lab.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Address */}
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{lab.address}</p>
                <p>
                  {lab.town}, {lab.county}
                </p>
              </div>
            </div>

            {/* County Badge */}
            <div className="flex items-center gap-2">
              {lab.county && (
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  {lab.county} County
                </Badge>
              )}
            </div>

            {/* Contact Info */}
            <div className="pt-2 space-y-2">
              {lab.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${lab.phone}`} className="hover:text-primary transition-colors" onClick={e => e.stopPropagation()}>
                    {lab.phone}
                  </a>
                </div>
              )}
              {lab.website && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="h-4 w-4" />
                  <a
                    href={lab.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors truncate"
                    onClick={e => e.stopPropagation()}
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}