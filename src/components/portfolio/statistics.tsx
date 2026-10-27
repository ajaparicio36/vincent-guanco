const STATISTICS = [
  { value: "28M+", label: "Total Views" },
  { value: "33K+", label: "Followers" },
  { value: "1M+", label: "Likes" },
] as const;

export function Statistics(): React.ReactElement {
  return (
    <section className="portfolio-statistics" aria-label="Statistics">
      <dl>
        {STATISTICS.map((statistic) => (
          <div key={statistic.label}>
            <dt>{statistic.label}</dt>
            <dd>{statistic.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
