import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-50",
  ghost:
    "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 disabled:opacity-40",
  danger:
    "bg-red-50 text-red-700 border border-red-300 hover:bg-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-800 disabled:opacity-50",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ variant = "primary", className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`rounded-2xl font-semibold transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
