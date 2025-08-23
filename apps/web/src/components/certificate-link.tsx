"use client";

import { useState, useEffect } from 'react';
import { Button } from '@web/components/ui/button';
import { ExternalLink } from 'lucide-react';

export function CertificateLink({ certificateName, friendlyName }: { 
  certificateName: string; 
  friendlyName: string;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        const response = await fetch(`/api/get-signed-certificate-url?name=${encodeURIComponent(certificateName)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch signed URL');
        }
        const data = await response.json();
        setSignedUrl(data.url);
      } catch (err) {
        console.error("Error fetching signed URL:", err);
        setError("Failed to load certificate");
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [certificateName]);

  if (loading) {
    return (
      <div className="flex w-full flex-row justify-between">
        <h4 className="text-sm">{friendlyName}</h4>
        <Button variant="outline" size="sm" disabled>
          Loading...
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full flex-row justify-between">
        <h4 className="text-sm">{friendlyName}</h4>
        <span className="text-sm text-red-500">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-row justify-between">
      <h4 className="text-sm">{friendlyName}</h4>
      <a
        href={signedUrl ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className={!signedUrl ? 'pointer-events-none opacity-50' : ''}
      >
        <Button variant="outline" size="sm" disabled={!signedUrl}>
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>View</span>
        </Button>
      </a>
    </div>
  );
}