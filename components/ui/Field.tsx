import { InputHTMLAttributes, LabelHTMLAttributes } from "react";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & { compact?: boolean };

export function FieldLabel({ compact = false, className = "", ...rest }: LabelProps) {
  const base = compact
    ? "block text-xs text-gray-500 dark:text-gray-400 mb-1"
    : "block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1";
  return <label {...rest} className={`${base} ${className}`} />;
}

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function FieldInput({ className = "", ...rest }: InputProps) {
  return (
    <input
      {...rest}
      className={`w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 ${className}`}
    />
  );
}
