import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";

type Variant = "default" | "muted" | "active";

const VARIANT_CLASSES: Record<Variant, string> = {
  default: "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors",
  muted: "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors",
  active: "font-semibold text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white pb-3 -mb-3",
};

type Props = LinkProps & {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

export function NavLink({ variant = "default", className = "", children, ...rest }: Props) {
  return (
    <Link {...rest} className={`${VARIANT_CLASSES[variant]} ${className}`}>
      {children}
    </Link>
  );
}
