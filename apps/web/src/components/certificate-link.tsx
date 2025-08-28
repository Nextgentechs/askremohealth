"use client";

import { useMemo } from 'react';
import { Button } from '@web/components/ui/button';
import { ExternalLink } from 'lucide-react';

export function CertificateLink({ certificateName, friendlyName, certificateId }: { 
  certificateName: string; 
  friendlyName: string;
  certificateId: string;
}) {
  // Construct the Contabo file URL directly
  const signedUrl = useMemo(() => {
    const bucketUuid = "cffd3bb200d44ed8918b75125fb1db77"; // your bucket UUID
    const bucketName = "askremohealth"; // your bucket name
    const region = "eu2"; // your Contabo region

    const decodedCertificateName = decodeURIComponent(certificateName);
    let finalCertificateName = decodedCertificateName;

    // Check if it's the old format (e.g., "documents/userId/medical-license" or "documents/userId/medical-license.pdf")
    if (decodedCertificateName.startsWith('documents/') && 
        (decodedCertificateName.endsWith('/medical-license') || decodedCertificateName.endsWith('/medical-license.pdf'))) {
      const parts = decodedCertificateName.split('/');
      if (parts.length === 3) { // Expecting "documents", "userId", "medical-license" or "medical-license.pdf"
        // Use the certificateId as the unique identifier for the filename
        finalCertificateName = `medical-licences/${certificateId}.pdf`;
      }
    }

    return `https://${region}.contabostorage.com/${bucketUuid}:${bucketName}/${finalCertificateName}`;
  }, [certificateName, certificateId]);

  return (
    <div className="flex w-full flex-row justify-between">
      <h4 className="text-sm">{friendlyName}</h4>
      <a
        href={signedUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="sm">
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>View</span>
        </Button>
      </a>
    </div>
  );
}
