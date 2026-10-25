/** Renders schema.org structured data as JSON-LD. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // `<` is escaped so the JSON can never close the script tag early.
      // biome-ignore lint/security/noDangerouslySetInnerHtml: serialised static JSON, no user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
