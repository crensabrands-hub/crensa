'use client';

import { JsonLdSchema } from '@/lib/seo/schema';

interface SchemaRendererProps {
  schema: JsonLdSchema | JsonLdSchema[];
}

export function SchemaRenderer({ schema }: SchemaRendererProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      suppressHydrationWarning
    />
  );
}
