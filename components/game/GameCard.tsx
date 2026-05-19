"use client";

import { Button } from "@/components/ui/Button";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";
import { GuessButton } from "@/components/ui/GuessButton";
import { Spinner } from "@/components/ui/Spinner";
import { GetGameAnswerDto, GetGameQuestionDto } from "@/lib/api";
import { useEffect, useState } from "react";

interface Props {
  question: GetGameQuestionDto;
  answer?: GetGameAnswerDto;
  onAnswer: (isDead: boolean) => void;
  onNext: () => void;
  onEnd: () => void;
  loading: boolean;
}

function formatYear(iso: string): string {
  return new Date(iso).getFullYear().toString();
}

export default function GameCard({
  question,
  answer,
  onAnswer,
  onNext,
  onEnd,
  loading,
}: Props) {
  const meta = answer?.meta ?? question.meta;
  const { person } = question;
  const progressPercentage = (meta.currentQuestion / meta.questionsNumber) * 100;
  const isLastQuestion =
    !!answer && answer.meta.currentQuestion >= answer.meta.questionsNumber;

  const [imageLoaded, setImageLoaded] = useState(false);
  useEffect(() => {
    setImageLoaded(false);
  }, [person.imageUrl]);

  const isLoadingNextQuestion = loading && !!answer;
  const showSpinner = isLoadingNextQuestion || !person.imageUrl || !imageLoaded;

  const banner: { state: "correct" | "wrong" | "placeholder", text: string } = answer
    ? { state: answer.correct ? "correct" : "wrong", text: answer.correct ? "Bonne réponse !" : "Mauvaise réponse !" }
    : { state: "placeholder", text: " " };

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-[min(28rem,42vh)] space-y-2">

        <div className="space-y-2">
          <div className="flex justify-between text-base text-gray-500 dark:text-gray-400">
            <span>Question {meta.currentQuestion} sur {meta.questionsNumber}</span>
            <span>Score : {meta.score}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 dark:bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="relative w-full aspect-square bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden flex items-center justify-center">
          {person.imageUrl && (
            <img
              src={person.imageUrl}
              alt={person.name}
              onLoad={() => setImageLoaded(true)}
              className={`h-full w-full object-contain transition-opacity duration-200 ${imageLoaded && !isLoadingNextQuestion ? "opacity-100" : "opacity-0"}`}
            />
          )}
          {showSpinner && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </div>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col h-[13rem] overflow-hidden">
          <div className="flex-1 min-h-0 space-y-1 overflow-hidden">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{person.name}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">{person.title}</p>
            <p className={`text-base text-gray-500 dark:text-gray-400 ${person.subtitle ? "" : "invisible"}`}>
              {person.subtitle ?? " "}
            </p>
          </div>

          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${answer ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}>
            {answer && (
              answer.person.isDead ? (
                <>
                  <p>
                    Décédé·e en {answer.person.deathDate ? formatYear(answer.person.deathDate) : "?"}
                    {" — à l'âge de "}
                    {answer.person.ageAtDeath ?? "?"} ans
                  </p>
                  {answer.person.daysSinceDeath !== undefined && (
                    <p>Il y a {answer.person.daysSinceDeath} jours</p>
                  )}
                </>
              ) : (
                <p>
                  Toujours en vie — né·e en {formatYear(answer.person.birthDate)},{" "}
                  {answer.person.age ?? "?"} ans
                </p>
              )
            )}
          </div>
        </div>

        <FeedbackBanner state={banner.state}>{banner.text}</FeedbackBanner>

        <div className="relative h-14">
          <div className={`absolute inset-0 transition-opacity duration-200 ${answer ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <div className="grid grid-cols-2 gap-4">
              <GuessButton
                variant="alive"
                onClick={() => onAnswer(false)}
                disabled={loading}
                className="py-3 text-xl"
              >
                Vivant·e
              </GuessButton>
              <GuessButton
                variant="dead"
                onClick={() => onAnswer(true)}
                disabled={loading}
                className="py-3 text-xl"
              >
                Mort·e
              </GuessButton>
            </div>
          </div>
          <div className={`absolute inset-0 transition-opacity duration-200 ${answer ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <Button
              onClick={isLastQuestion ? onEnd : onNext}
              disabled={loading}
              className="w-full py-3 text-xl font-bold"
            >
              {loading
                ? "Chargement…"
                : isLastQuestion
                  ? "Voir les résultats"
                  : "Question suivante"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
