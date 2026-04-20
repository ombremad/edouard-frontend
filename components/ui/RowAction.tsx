import { ButtonHTMLAttributes } from "react";

type Variant = "default" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  default: "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
  danger: "text-red-700 hover:text-red-300 dark:text-red-300 dark:hover:text-red-800",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function RowAction({ variant = "default", className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`text-xs transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
