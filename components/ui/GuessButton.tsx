import { ButtonHTMLAttributes } from "react";

type Variant = "alive" | "dead";

const VARIANT_CLASSES: Record<Variant, string> = {
  alive: "bg-sky-600 text-white hover:bg-sky-500",
  dead: "bg-slate-600 text-white hover:bg-slate-500",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant: Variant };

export function GuessButton({ variant, className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`rounded-2xl font-bold transition-colors disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
