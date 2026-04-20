"use client";

import { Button } from "@/components/ui/Button";
import { GetGameResultsDto } from "@/lib/api";

interface Props {
  results: GetGameResultsDto;
  onPlayAgain: () => void;
}

const SCORE_EMOJI_TIERS: ReadonlyArray<{ minPercentage: number; emoji: string }> = [
  { minPercentage: 100, emoji: "🏆" },
  { minPercentage: 80, emoji: "🚀" },
  { minPercentage: 60, emoji: "✨" },
  { minPercentage: 40, emoji: "😅" },
  { minPercentage: 20, emoji: "😵" },
  { minPercentage: 0, emoji: "🪦" }
];

function emojiForScore(percentage: number): string {
  const tier = SCORE_EMOJI_TIERS.find((tier) => percentage >= tier.minPercentage);
  return tier?.emoji ?? "💀";
}

export default function ResultsScreen({ results, onPlayAgain }: Props) {
  const percentage =
    typeof results.correctPercentage === "number"
      ? Math.round(results.correctPercentage)
      : Math.round((results.score / results.questionsNumber) * 100);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center space-y-8 max-w-sm w-full">
        <div className="space-y-2">
          <div className="text-6xl">{emojiForScore(percentage)}</div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Fin de la partie</h2>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 space-y-4">
          <div>
            <p className="text-6xl font-bold text-gray-900 dark:text-white font-[family-name:var(--font-fraunces)]">{percentage}%</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">de bonnes réponses</p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4 text-gray-600 dark:text-gray-300">
            {results.score} / {results.questionsNumber} questions
          </div>
        </div>

        <Button
          onClick={onPlayAgain}
          className="w-full py-3 px-6 rounded-xl text-lg font-bold"
        >
          Rejouer
        </Button>
      </div>
    </div>
  );
}
