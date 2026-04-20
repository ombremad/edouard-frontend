"use client";

import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/Field";
import { LengthOption } from "@/components/ui/LengthOption";
import { FormEvent, useState } from "react";

interface Props {
  onStart: (length: number) => void;
  loading: boolean;
}

const QUESTION_LENGTH_OPTIONS = [
  { value: 10, label: "Courte" },
  { value: 25, label: "Moyenne" },
  { value: 50, label: "Longue" },
] as const;
const DEFAULT_QUESTION_COUNT = 10;

export default function StartGame({ onStart, loading }: Props) {
  const [length, setLength] = useState<number>(DEFAULT_QUESTION_COUNT);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onStart(length);
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-xl space-y-10 text-center">

        <div className="space-y-3">
          <span aria-hidden className="block text-gray-400 dark:text-gray-600 text-xl">❖</span>
          <h1 className="text-6xl font-bold tracking-[0.15em] text-gray-900 dark:text-white">
            ÉDOUARD
          </h1>
          <p className="italic text-gray-500 dark:text-gray-400">
            Le jeu du « il est mort lui ou pas ? »
          </p>
        </div>

        <div className="text-left rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
            <span aria-hidden>ⓘ</span>
            À lire avant de jouer
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ce jeu n'a pas pour but de se moquer des célébrités nommées, ni de leurs familles, mais bien de proposer une forme un peu macabre de divertissement, à destination d'adultes responsables et consentants. Si ce principe choque votre sensibilité, nous vous invitons à ne pas jouer à Édouard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <FieldLabel className="text-center">Nombre de questions</FieldLabel>
            <div className="flex items-center justify-center gap-3">
              {QUESTION_LENGTH_OPTIONS.map((option) => (
                <LengthOption
                  key={option.value}
                  type="button"
                  onClick={() => setLength(option.value)}
                  selected={length === option.value}
                  label={option.label}
                >
                  {option.value}
                </LengthOption>
              ))}
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl text-xl font-bold"
          >
            {loading ? "Démarrage…" : "Commencer  →"}
          </Button>
        </form>

      </div>
    </div>
  );
}
