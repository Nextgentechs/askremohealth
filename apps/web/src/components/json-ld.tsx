'use client'

interface JsonLdProps {
  data: Record<string, unknown>
}

/**
 * Component to render JSON-LD structured data in the document head
 * @see https://developers.google.com/search/docs/appearance/structured-data
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0),
      }}
    />
  )
}
