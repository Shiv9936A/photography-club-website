function LoadingSkeleton() {
  const pulse = "animate-pulse rounded-[12px] bg-secondary";

  return (
    <div className="max-w-container mx-auto px-container-px py-8 md:px-container-px-md">
      <div className={`${pulse} h-[420px]`} aria-label="Loading event hero" />
      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className={`${pulse} h-72`} aria-label="Loading event content" />
        <div className={`${pulse} h-72`} aria-label="Loading event information card" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5" aria-label="Loading statistics">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className={`${pulse} h-28`} />
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3" aria-label="Loading gallery">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className={`${pulse} h-64`} />
        ))}
      </div>
    </div>
  );
}

export default LoadingSkeleton;
