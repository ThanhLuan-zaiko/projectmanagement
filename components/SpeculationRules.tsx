const appNavigationSpeculationRules = {
  prefetch: [
    {
      where: {
        selector_matches: 'a[data-speculate="prefetch"]',
      },
      eagerness: 'moderate',
    },
  ],
} as const;

export default function SpeculationRules() {
  return (
    <script
      type="speculationrules"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(appNavigationSpeculationRules),
      }}
    />
  );
}
