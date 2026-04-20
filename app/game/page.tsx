"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  startGame,
  answerQuestion,
  nextQuestion,
  endGame,
  GetGameQuestionDto,
  GetGameAnswerDto,
  GetGameResultsDto,
} from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import Header from "@/components/ui/Header";
import StartGame from "@/components/game/StartGame";
import GameCard from "@/components/game/GameCard";
import ResultsScreen from "@/components/game/ResultsScreen";

type GameState = "idle" | "playing" | "answered" | "finished";

export default function GamePage() {
  const { token, initialized } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<GameState>("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState<GetGameQuestionDto | null>(null);
  const [answer, setAnswer] = useState<GetGameAnswerDto | null>(null);
  const [results, setResults] = useState<GetGameResultsDto | null>(null);

  useEffect(() => {
    if (!initialized) return;
    if (!token) router.replace("/login");
  }, [initialized, token, router]);

  const authenticated = initialized && !!token;

  async function handleStart(length: number) {
    setError("");
    setAnswer(null);
    setResults(null);
    setLoading(true);
    try {
      const newQuestion = await startGame(length);
      setQuestion(newQuestion);
      setState("playing");
    } catch (cause) {
      setError(`Impossible de démarrer la partie : ${errorMessage(cause)}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswer(isDead: boolean) {
    if (!question) return;
    setLoading(true);
    try {
      const newAnswer = await answerQuestion(question.meta.gameId, isDead);
      setAnswer(newAnswer);
      setState("answered");
    } catch (cause) {
      setError(`Erreur lors de la réponse : ${errorMessage(cause)}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleNext() {
    if (!answer) return;
    setLoading(true);
    try {
      const newQuestion = await nextQuestion(answer.meta.gameId);
      setQuestion(newQuestion);
      setAnswer(null);
      setState("playing");
    } catch (cause) {
      setError(`Erreur lors du chargement : ${errorMessage(cause)}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnd() {
    if (!answer) return;
    setLoading(true);
    try {
      const finalResults = await endGame(answer.meta.gameId);
      setResults(finalResults);
      setState("finished");
    } catch (cause) {
      setError(`Erreur lors de la fin de partie : ${errorMessage(cause)}`);
    } finally {
      setLoading(false);
    }
  }

  function handlePlayAgain() {
    setQuestion(null);
    setAnswer(null);
    setResults(null);
    setState("idle");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-1 flex-col px-4 py-4">
        {error && (
          <div className="mb-4 max-w-md mx-auto w-full p-3 rounded-lg bg-red-50 border border-red-300 text-red-700 dark:bg-red-900 dark:border-red-800 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
        {authenticated && state === "idle" && (
          <StartGame onStart={handleStart} loading={loading} />
        )}
        {authenticated && (state === "playing" || state === "answered") && question && (
          <GameCard
            question={question}
            answer={state === "answered" ? (answer ?? undefined) : undefined}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onEnd={handleEnd}
            loading={loading}
          />
        )}
        {authenticated && state === "finished" && results && (
          <ResultsScreen results={results} onPlayAgain={handlePlayAgain} />
        )}
      </main>
    </div>
  );
}
