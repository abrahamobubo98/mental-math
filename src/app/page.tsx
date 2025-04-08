"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Define available operations
const OPERATIONS = {
  "+": "Addition",
  "-": "Subtraction",
  "*": "Multiplication",
  "/": "Division",
} as const;

// Define number types
const NUMBER_TYPES = {
  integers: "Integers",
  decimals: "Decimals",
  fractions: "Fractions",
} as const;

// Define available max digits (for integers)
const MAX_DIGITS = [1, 2, 3, 4] as const;

// Define available decimal places
const DECIMAL_PLACES = [1, 2, 3, 4] as const;

type Operation = keyof typeof OPERATIONS;
type NumberType = keyof typeof NUMBER_TYPES;
type MaxDigits = typeof MAX_DIGITS[number];
type DecimalPlaces = typeof DECIMAL_PLACES[number];

// Define difficulty levels and their parameters
const DIFFICULTY_LEVELS = {
  easy: { maxNum: 10 },
  medium: { maxNum: 25 },
  hard: { maxNum: 50 },
} as const;

// Define available time limits (in seconds)
const TIME_LIMITS = [30, 60, 120, 180, 300] as const;

type Difficulty = keyof typeof DIFFICULTY_LEVELS;
type TimeLimit = typeof TIME_LIMITS[number];

interface Problem {
  num1: number | string;
  num2: number | string;
  operation: Operation;
  answer: number | string;
  type: NumberType;
}

export default function Home() {
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [selectedTimeLimit, setSelectedTimeLimit] = useState<TimeLimit>(60);
  const [isActive, setIsActive] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [selectedOperations, setSelectedOperations] = useState<Operation[]>(["+", "-", "*", "/"]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [selectedNumberTypes, setSelectedNumberTypes] = useState<NumberType[]>(["integers"]);
  const [maxDigits, setMaxDigits] = useState<MaxDigits>(2);
  const [maxDecimalPlaces, setMaxDecimalPlaces] = useState<DecimalPlaces>(2);
  const [totalAttempts, setTotalAttempts] = useState(0);

  // Get max number based on digits
  const getMaxNumber = (digits: number) => {
    return Math.pow(10, digits) - 1;
  };

  // Generate a random decimal with specified decimal places
  const generateDecimal = (maxNum: number, decimalPlaces: number): number => {
    const num = Math.random() * maxNum;
    return Number(num.toFixed(decimalPlaces));
  };

  // Generate a random fraction
  const generateFraction = (max: number): { numerator: number; denominator: number } => {
    const denominator = Math.floor(Math.random() * (max - 1)) + 2; // 2 to max
    const numerator = Math.floor(Math.random() * (denominator * 2)) + 1; // 1 to 2*denominator
    return { numerator, denominator };
  };

  // Fraction operations
  const fractionOperations = {
    "+": (n1: number, d1: number, n2: number, d2: number) => {
      const lcm = (d1 * d2) / gcd(d1, d2);
      const num1 = n1 * (lcm / d1);
      const num2 = n2 * (lcm / d2);
      const numSum = num1 + num2;
      const gcdResult = gcd(numSum, lcm);
      return `${numSum / gcdResult}/${lcm / gcdResult}`;
    },
    "-": (n1: number, d1: number, n2: number, d2: number) => {
      const lcm = (d1 * d2) / gcd(d1, d2);
      const num1 = n1 * (lcm / d1);
      const num2 = n2 * (lcm / d2);
      const numDiff = num1 - num2;
      const gcdResult = gcd(Math.abs(numDiff), lcm);
      return `${numDiff / gcdResult}/${lcm / gcdResult}`;
    },
    "*": (n1: number, d1: number, n2: number, d2: number) => {
      const numProduct = n1 * n2;
      const denProduct = d1 * d2;
      const gcdResult = gcd(numProduct, denProduct);
      return `${numProduct / gcdResult}/${denProduct / gcdResult}`;
    },
    "/": (n1: number, d1: number, n2: number, d2: number) => {
      const numProduct = n1 * d2;
      const denProduct = d1 * n2;
      const gcdResult = gcd(numProduct, denProduct);
      return `${numProduct / gcdResult}/${denProduct / gcdResult}`;
    },
  };

  // Greatest Common Divisor
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  // Generate a random problem based on settings
  const generateProblem = useCallback(() => {
    if (selectedOperations.length === 0 || selectedNumberTypes.length === 0) return;

    const operation = selectedOperations[Math.floor(Math.random() * selectedOperations.length)] as Operation;
    const numberType = selectedNumberTypes[Math.floor(Math.random() * selectedNumberTypes.length)] as NumberType;

    let num1: number | string;
    let num2: number | string;
    let answer: number | string;

    const maxNum = getMaxNumber(maxDigits);

    if (numberType === "decimals") {
      num1 = generateDecimal(maxNum, maxDecimalPlaces);
      num2 = generateDecimal(maxNum, maxDecimalPlaces);

      if (operation === "/" && num2 === 0) num2 = generateDecimal(maxNum, maxDecimalPlaces);

      switch (operation) {
        case "+": answer = Number((num1 + num2).toFixed(maxDecimalPlaces)); break;
        case "-": answer = Number((num1 - num2).toFixed(maxDecimalPlaces)); break;
        case "*": answer = Number((num1 * num2).toFixed(maxDecimalPlaces)); break;
        case "/": answer = Number((num1 / num2).toFixed(maxDecimalPlaces)); break;
        default: answer = 0;
      }
    } else if (numberType === "fractions") {
      const frac1 = generateFraction(maxNum);
      const frac2 = generateFraction(maxNum);
      
      num1 = `${frac1.numerator}/${frac1.denominator}`;
      num2 = `${frac2.numerator}/${frac2.denominator}`;
      
      answer = fractionOperations[operation](
        frac1.numerator,
        frac1.denominator,
        frac2.numerator,
        frac2.denominator
      );
    } else {
      // Integers
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * maxNum) + 1;

      if (operation === "/") {
        num2 = Math.floor(Math.random() * (maxNum / 10)) + 1;
        num1 = num2 * (Math.floor(Math.random() * 10) + 1);
      }

      if (operation === "-" && num2 > num1) {
        [num1, num2] = [num2, num1];
      }

      switch (operation) {
        case "+": answer = num1 + num2; break;
        case "-": answer = num1 - num2; break;
        case "*": answer = num1 * num2; break;
        case "/": answer = num1 / num2; break;
        default: answer = 0;
      }
    }

    setCurrentProblem({ num1, num2, operation, answer, type: numberType });
  }, [difficulty, selectedOperations, selectedNumberTypes, maxDigits, maxDecimalPlaces, fractionOperations]);

  // Toggle operation selection
  const toggleOperation = (operation: Operation) => {
    if (isActive) return; // Prevent changes during game

    setSelectedOperations((prev) => {
      if (prev.includes(operation)) {
        // Don't allow deselecting if it's the last operation
        if (prev.length === 1) return prev;
        return prev.filter(op => op !== operation);
      } else {
        return [...prev, operation];
      }
    });
  };

  // Toggle all operations
  const toggleAllOperations = () => {
    if (isActive) return;
    
    setSelectedOperations((prev) => {
      // If all operations are selected, clear all except one
      // If not all are selected, select all
      return prev.length === Object.keys(OPERATIONS).length ? ["+"] : Object.keys(OPERATIONS) as Operation[];
    });
  };

  // Toggle number type selection
  const toggleNumberType = (type: NumberType) => {
    if (isActive) return;

    setSelectedNumberTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev;
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // Toggle all number types
  const toggleAllNumberTypes = () => {
    if (isActive) return;
    
    setSelectedNumberTypes((prev) => {
      return prev.length === Object.keys(NUMBER_TYPES).length
        ? ["integers"]
        : Object.keys(NUMBER_TYPES) as NumberType[];
    });
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !gameOver) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setGameOver(true);
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, gameOver]);

  // Start game
  const startGame = () => {
    if (selectedOperations.length === 0) return;
    setIsActive(true);
    setIsSettingsOpen(false);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTotalAttempts(0);
    setTimeLeft(selectedTimeLimit);
    setGameOver(false);
    generateProblem();
  };

  // Reset game
  const resetGame = () => {
    setIsActive(false);
    setGameOver(false);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTotalAttempts(0);
    setTimeLeft(selectedTimeLimit);
    setCurrentProblem(null);
    setAnswer("");
    setFeedback(null);
    setIsSettingsOpen(true);
  };

  // Convert fraction string to decimal
  const fractionToDecimal = (fraction: string): number | null => {
    const parts = fraction.split("/");
    if (parts.length !== 2) return null;
    
    const numerator = Number(parts[0]);
    const denominator = Number(parts[1]);
    
    if (isNaN(numerator) || isNaN(denominator) || denominator === 0) return null;
    return numerator / denominator;
  };

  // Convert decimal to fraction string
  const decimalToFraction = (decimal: number): string => {
    const precision = 1000000; // 6 decimal places
    let numerator = decimal * precision;
    let denominator = precision;
    const gcdValue = gcd(Math.round(numerator), denominator);
    numerator = Math.round(numerator / gcdValue);
    denominator = denominator / gcdValue;
    return `${numerator}/${denominator}`;
  };

  // Check if string is a valid number (decimal or fraction)
  const isValidNumber = (str: string): boolean => {
    // Check if it's a valid decimal
    if (!isNaN(Number(str))) return true;
    
    // Check if it's a valid fraction
    const parts = str.split("/");
    if (parts.length !== 2) return false;
    return !isNaN(Number(parts[0])) && !isNaN(Number(parts[1])) && Number(parts[1]) !== 0;
  };

  // Check answer with support for both decimal and fraction formats
  const checkAnswer = () => {
    if (!currentProblem || gameOver || !answer.trim()) return;
    
    // Increment total attempts whenever an answer is submitted
    setTotalAttempts(prev => prev + 1);
    
    if (!isValidNumber(answer)) {
      setFeedback("incorrect");
      setStreak(0);
      return;
    }

    let userDecimal: number;
    let correctDecimal: number;
    
    // Convert user answer to decimal
    if (answer.includes("/")) {
      const decimalValue = fractionToDecimal(answer);
      if (decimalValue === null) {
        setFeedback("incorrect");
        setStreak(0);
        return;
      }
      userDecimal = decimalValue;
    } else {
      userDecimal = Number(answer);
    }

    // Convert correct answer to decimal
    if (typeof currentProblem.answer === "string" && currentProblem.answer.includes("/")) {
      const decimalValue = fractionToDecimal(currentProblem.answer);
      if (decimalValue === null) {
        console.error("Invalid problem answer format");
        return;
      }
      correctDecimal = decimalValue;
    } else {
      correctDecimal = Number(currentProblem.answer);
    }

    // Compare with small tolerance for floating-point arithmetic
    const isCorrect = Math.abs(userDecimal - correctDecimal) < 0.0001;
    
    setFeedback(isCorrect ? "correct" : "incorrect");
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;
        // Update best streak if current streak is higher
        setBestStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    // Show the correct answer in both formats when wrong
    if (!isCorrect) {
      setTimeout(() => {
        const correctAnswerDecimal = correctDecimal.toFixed(4);
        const correctAnswerFraction = decimalToFraction(correctDecimal);
        setFeedback(`The correct answer is ${correctAnswerDecimal} or ${correctAnswerFraction}`);
      }, 1000);

      setTimeout(() => {
        setFeedback(null);
        setAnswer("");
        generateProblem();
      }, 3000);
    } else {
      setTimeout(() => {
        setFeedback(null);
        setAnswer("");
        generateProblem();
      }, 1000);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !gameOver) {
      checkAnswer();
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get operation symbol for display
  const getOperationSymbol = (operation: Operation) => {
    switch (operation) {
      case "*": return "×";
      case "/": return "÷";
      default: return operation;
    }
  };

  // Calculate score metrics
  const calculateMetrics = () => {
    const timeUsed = selectedTimeLimit - timeLeft;
    const minutesUsed = timeUsed / 60;
    const questionsPerMinute = timeUsed > 0 ? (totalAttempts / minutesUsed).toFixed(1) : "0.0";
    const accuracy = totalAttempts > 0 ? ((score / totalAttempts) * 100).toFixed(1) : "0.0";
    
    return {
      timeUsed,
      questionsPerMinute,
      accuracy,
    };
  };

  // Quit game
  const quitGame = () => {
    setGameOver(true);
    setIsActive(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-100 to-neutral-200 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-neutral-800">Mental Math Trainer</h1>
          <p className="text-neutral-600">Sharpen your mental math skills with quick calculations</p>
        </div>

        {/* Game Settings Dropdown */}
        <Collapsible
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          disabled={isActive}
          className="space-y-2"
        >
          <Card>
            <CardHeader className="py-3">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <CardTitle className="text-xl">Game Settings</CardTitle>
                <Button variant="ghost" size="sm" disabled={isActive}>
                  {isSettingsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Number Settings */}
                <div className="space-y-4">
                  {/* Integer Digits Selection */}
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-600">Maximum Integer Digits</p>
                    <div className="flex justify-center gap-4">
                      {MAX_DIGITS.map((digits) => (
                        <Button
                          key={digits}
                          onClick={() => !isActive && setMaxDigits(digits)}
                          variant={maxDigits === digits ? "default" : "outline"}
                          className="w-16"
                          disabled={isActive}
                        >
                          {digits}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-center text-neutral-500">
                      Max number: {getMaxNumber(maxDigits).toLocaleString()}
                    </p>
                  </div>

                  {/* Decimal Places Selection */}
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-600">Maximum Decimal Places</p>
                    <div className="flex justify-center gap-4">
                      {DECIMAL_PLACES.map((places) => (
                        <Button
                          key={places}
                          onClick={() => !isActive && setMaxDecimalPlaces(places)}
                          variant={maxDecimalPlaces === places ? "default" : "outline"}
                          className="w-16"
                          disabled={isActive}
                        >
                          {places}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-center text-neutral-500">
                      Example: {generateDecimal(10, maxDecimalPlaces)}
                    </p>
                  </div>
                </div>

                {/* Number Type Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-neutral-600">Number Types</p>
                    <Button
                      onClick={toggleAllNumberTypes}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      disabled={isActive}
                    >
                      {selectedNumberTypes.length === Object.keys(NUMBER_TYPES).length ? "Clear All" : "Select All"}
                    </Button>
                  </div>
                  <div className="flex justify-center gap-4 flex-wrap">
                    {(Object.entries(NUMBER_TYPES) as [NumberType, string][]).map(([type, name]) => (
                      <Button
                        key={type}
                        onClick={() => toggleNumberType(type)}
                        variant={selectedNumberTypes.includes(type) ? "default" : "outline"}
                        className="w-32"
                        disabled={isActive}
                      >
                        {name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Operations Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-neutral-600">Select Operations</p>
                    <Button
                      onClick={toggleAllOperations}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      disabled={isActive}
                    >
                      {selectedOperations.length === Object.keys(OPERATIONS).length ? "Clear All" : "Select All"}
                    </Button>
                  </div>
                  <div className="flex justify-center gap-4 flex-wrap">
                    {(Object.entries(OPERATIONS) as [Operation, string][]).map(([op, name]) => (
                      <Button
                        key={op}
                        onClick={() => toggleOperation(op)}
                        variant={selectedOperations.includes(op) ? "default" : "outline"}
                        className="w-32"
                        disabled={isActive}
                      >
                        {name} {getOperationSymbol(op)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div className="space-y-2">
                  <p className="text-sm text-neutral-600">Select Difficulty</p>
                  <div className="flex justify-center gap-4">
                    {(Object.keys(DIFFICULTY_LEVELS) as Difficulty[]).map((level) => (
                      <Button
                        key={level}
                        onClick={() => !isActive && setDifficulty(level)}
                        variant={difficulty === level ? "default" : "outline"}
                        className="capitalize"
                        disabled={isActive}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Time Limit Selection */}
                <div className="space-y-2">
                  <p className="text-sm text-neutral-600">Select Time Limit</p>
                  <div className="flex justify-center gap-4 flex-wrap">
                    {TIME_LIMITS.map((limit) => (
                      <Button
                        key={limit}
                        onClick={() => !isActive && setSelectedTimeLimit(limit)}
                        variant={selectedTimeLimit === limit ? "default" : "outline"}
                        className="w-24"
                        disabled={isActive}
                      >
                        {formatTime(limit)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Settings Hint */}
                <div className="pt-4 border-t">
                  <p className="text-xs text-center text-neutral-500">
                    💡 Black buttons indicate selected options
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Main Game Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Practice Mode</CardTitle>
            <CardDescription className="text-center">
              {isActive ? "Solve arithmetic problems as quickly as you can" : gameOver ? "Game Over!" : "Click Start to begin"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isActive && !gameOver ? (
              <Button 
                onClick={startGame} 
                className="w-full py-8 text-lg"
                disabled={selectedOperations.length === 0}
              >
                Start Game
              </Button>
            ) : gameOver ? (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold">Game Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-sm text-neutral-600">Final Score</p>
                      <p className="text-2xl font-bold">{score}</p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-sm text-neutral-600">Total Questions</p>
                      <p className="text-2xl font-bold">{totalAttempts}</p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-sm text-neutral-600">Best Streak</p>
                      <p className="text-2xl font-bold">{bestStreak}</p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-sm text-neutral-600">Questions/Min</p>
                      <p className="text-2xl font-bold">{calculateMetrics().questionsPerMinute}</p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg col-span-2">
                      <p className="text-sm text-neutral-600">Accuracy</p>
                      <p className="text-2xl font-bold">{calculateMetrics().accuracy}%</p>
                    </div>
                  </div>

                  {/* Game Settings Summary */}
                  <div className="bg-neutral-50 p-6 rounded-lg space-y-4 mt-4">
                    <p className="font-semibold text-neutral-800">Game Settings Used</p>
                    
                    {/* Number Types */}
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-600">Number Types:</p>
                      <p className="text-neutral-800">
                        {selectedNumberTypes.map(type => NUMBER_TYPES[type]).join(", ")}
                      </p>
                    </div>

                    {/* Operations */}
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-600">Operations:</p>
                      <p className="text-neutral-800">
                        {selectedOperations.map(op => OPERATIONS[op]).join(", ")}
                      </p>
                    </div>

                    {/* Number Range Settings */}
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-600">Number Settings:</p>
                      <p className="text-neutral-800">
                        Max Integer Digits: {maxDigits}, Max Decimal Places: {maxDecimalPlaces}
                      </p>
                    </div>

                    {/* Time and Difficulty */}
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-600">Game Mode:</p>
                      <p className="text-neutral-800">
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty, {formatTime(selectedTimeLimit)} Time Limit
                      </p>
                    </div>
                  </div>
                </div>
                <Button onClick={resetGame} className="w-full py-6 text-lg">
                  Play Again
                </Button>
              </div>
            ) : (
              <>
                {/* Timer Display */}
                <div className="text-center space-y-2">
                  <motion.p
                    key={timeLeft}
                    animate={{ scale: timeLeft <= 10 ? [1, 1.2, 1] : 1 }}
                    className={`text-3xl font-bold ${timeLeft <= 10 ? "text-red-500" : ""}`}
                  >
                    {formatTime(timeLeft)}
                  </motion.p>
                  <Button
                    onClick={quitGame}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                  >
                    End Game
                  </Button>
                </div>

                {/* Problem Display */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentProblem?.answer}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-neutral-100 p-8 rounded-lg"
                  >
                    <p className="text-3xl font-mono text-center">
                      {currentProblem?.num1} {getOperationSymbol(currentProblem?.operation as Operation)} {currentProblem?.num2} = ?
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Answer Input */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      type="text"
                      placeholder={
                        currentProblem?.type === "fractions"
                          ? "Enter your answer (e.g., 1/2 or 0.5)"
                          : currentProblem?.type === "decimals"
                          ? "Enter your answer (e.g., 0.5 or 1/2)"
                          : "Enter your answer"
                      }
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="text-lg"
                    />
                    <Button onClick={checkAnswer} className="px-8">
                      Submit
                    </Button>
                  </div>
                </div>

                {/* Feedback Animation */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`text-center text-lg font-bold ${
                        feedback === "correct"
                          ? "text-green-600"
                          : feedback === "incorrect"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {feedback === "correct"
                        ? "Correct! 🎉"
                        : feedback === "incorrect"
                        ? "Try again! 💪"
                        : feedback}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Stats Display */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-sm text-neutral-600">Score</p>
                    <motion.p
                      key={score}
                      animate={{ scale: [1, 1.2, 1] }}
                      className="text-2xl font-bold"
                    >
                      {score}
                    </motion.p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-neutral-600">Streak</p>
                    <motion.p
                      key={streak}
                      animate={{ scale: [1, 1.2, 1] }}
                      className="text-2xl font-bold"
                    >
                      {streak}
                    </motion.p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>How to Play</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-neutral-600">
              <li>Select the operations you want to practice</li>
              <li>Choose your preferred difficulty level and time limit</li>
              <li>Click Start to begin the game</li>
              <li>Mental math problems will appear on the screen</li>
              <li>Type your answer in the input field</li>
              <li>Press Enter or click Submit to check your answer</li>
              <li>Try to solve as many problems as you can before time runs out</li>
              <li>Build up your streak for an extra challenge!</li>
              <li>Click &quot;End Game&quot; at any time to see your final score</li>
            </ul>
          </CardContent>
        </Card>
    </div>
    </main>
  );
}
