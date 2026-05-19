import { HTMLAttributes } from "react";

type State = "correct" | "wrong" | "placeholder";

const STATE_CLASSES: Record<State, string> = {
  correct:
    "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-900 dark:border-emerald-800 dark:text-emerald-300",
  wrong:
    "bg-red-50 border-red-300 text-red-700 dark:bg-red-900 dark:border-red-800 dark:text-red-300",
  placeholder:
    "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-900 dark:border-emerald-800 dark:text-emerald-300 invisible",
};

type Props = HTMLAttributes<HTMLDivElement> & { state: State };

export function FeedbackBanner({ state, className = "", children, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={`rounded-2xl p-4 text-center font-bold text-xl border transition-colors duration-300 ${STATE_CLASSES[state]} ${className}`}
    >
      {children}
    </div>
  );
}
