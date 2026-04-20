interface Props {
  className?: string;
}

export function Spinner({ className = "h-12 w-12" }: Props) {
  return (
    <div
      role="status"
      aria-label="Chargement"
      className={`animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-white ${className}`}
    />
  );
}
