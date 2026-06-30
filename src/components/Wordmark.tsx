type WordmarkProps = {
  className?: string;
};

/** "SOULS ALIGN" in tracked serif caps. */
export function Wordmark({ className = "" }: WordmarkProps) {
  return (
    <span className={`wordmark ${className}`}>SOULS ALIGN</span>
  );
}
