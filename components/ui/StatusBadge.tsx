import { HTMLAttributes } from "react";

type Variant = "alive" | "dead" | "role";

const VARIANT_CLASSES: Record<Variant, string> = {
  alive: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  dead: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  role: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

type Props = HTMLAttributes<HTMLSpanElement> & { variant: Variant };

export function StatusBadge({ variant, className = "", ...rest }: Props) {
  return (
    <span
      {...rest}
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
