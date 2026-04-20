import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  label?: string;
};

export function LengthOption({ selected = false, label, className = "", children, ...rest }: Props) {
  const stateClasses = selected
    ? "bg-gray-900 text-white ring-2 ring-gray-900 hover:bg-gray-900 dark:bg-white dark:text-gray-900 dark:ring-white dark:hover:bg-white"
    : "bg-gray-100 text-gray-700 ring-2 ring-transparent hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700";

  return (
    <button
      {...rest}
      className={`w-24 h-24 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors ${stateClasses} ${className}`}
    >
      <span className="text-3xl font-bold font-[family-name:var(--font-fraunces)]">{children}</span>
      {label && <span className="text-xs font-medium opacity-80">{label}</span>}
    </button>
  );
}
