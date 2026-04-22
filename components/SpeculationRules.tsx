const appNavigationSpeculationRules = {
  prefetch: [
    {
      where: {
        selector_matches: ['a[data-speculate="prefetch"]', 'a[data-speculate="prerender"]'],
      },
      eagerness: 'moderate',
    },
  ],
  prerender: [
    {
      where: {
        selector_matches: 'a[data-speculate="prerender"]',
      },
      eagerness: 'conservative',
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
