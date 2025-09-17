import { Button } from "./components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSurveyStore } from "./store/surveyStore";
import { useEffect, useState } from "react";
import useSurvey from "./hooks/useSurvey";
import { Checkbox } from "./components/ui/checkbox";
import { Textarea } from "./components/ui/textarea";
import { IoIosArrowBack } from "react-icons/io";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Input } from "./components/ui/input";
import Smile from "../src/assets/smile.png";

const queryClient = new QueryClient();

function App() {
  const isBeginSurvey = useSurveyStore((state) => state.isBeginSurvey);
  const isSubmitSurvey = useSurveyStore((state) => state.isSubmitSurvey);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* Simple Header */}
        <header className="bg-white border-b border-gray-200 py-4 sm:py-6">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              eMa Survey
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Help us improve by sharing your feedback
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-100px)] grid place-items-center px-4 py-8">
          {isBeginSurvey && !isSubmitSurvey ? (
            <SurveyContainer />
          ) : (
            !isSubmitSurvey && <SetName />
          )}
          {isSubmitSurvey && <SuccessSubmitSurvey />}{" "}
        </main>
      </div>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

export default App;

function SuccessSubmitSurvey() {
  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto text-center p-6 sm:p-8 bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100">
      {/* Success Icon */}
      <div className="mb-4 sm:mb-6">
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 sm:w-10 sm:h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Success Message */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
          Thank You! 🙏
        </h2>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
          Your survey has been submitted successfully. We appreciate you taking
          the time to share your valuable feedback with us.
        </p>
      </div>

      {/* Optional: Additional Info */}
      <p className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6 px-2">
        Your responses will help us improve our services
      </p>
    </div>
  );
}

function SetName() {
  const userName = useSurveyStore((state) => state.userName);
  const setUserName = useSurveyStore((state) => state.setUserName);
  const setIsBeginSurvey = useSurveyStore((state) => state.setIsBeginSurvey);

  const isValidName =
    userName.trim().length >= 2 &&
    userName.trim().length <= 50 &&
    /^[a-zA-Z\s]+$/.test(userName);

  return (
    <div className="w-full max-w-sm sm:max-w-lg mx-auto space-y-4 sm:space-y-6 flex flex-col px-4">
      <div className="text-center sm:text-left">
        <h2 className="text-sm sm:text-base text-muted-foreground mb-2">
          Hello our dear!
        </h2>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
          Please write your name to begin the survey
        </h1>
      </div>

      <Input
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="w-full text-base sm:text-lg p-3 sm:p-4"
        placeholder="Enter your name here..."
      />

      <Button
        disabled={!isValidName}
        className="w-full sm:w-auto sm:self-end px-8 py-3 text-base font-medium"
        onClick={() => setIsBeginSurvey(true)}
      >
        Begin Survey
      </Button>
    </div>
  );
}

function SurveyContainer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(50);

  const { questions, questionsLoading, questionsError, questionsErrorDetails } =
    useSurvey(currentPage, limit);

  const setTotalSteps = useSurveyStore((state) => state.setTotalSteps);
  const totalSteps = useSurveyStore((state) => state.totalSteps);
  const currentStep = useSurveyStore((state) => state.currentStep);

  useEffect(() => {
    if (!questionsLoading && questions) {
      setTotalSteps(questions.length);
    }
  }, [questions, questionsLoading, setTotalSteps]);

  if (questionsLoading)
    return <div className="text-center text-lg">Loading . . .</div>;
  if (questionsError) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading questions: {questionsErrorDetails?.message}
      </div>
    );
  }
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return <div className="text-center p-4">No questions available</div>;
  }
  if (totalSteps === 0) {
    return <div className="text-center p-4">Initializing survey...</div>;
  }

  const currentQuestion = questions[currentStep];

  if (!currentQuestion) {
    return <div className="text-center p-4">Question not found</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-y-4 sm:gap-y-6 px-4 py-6 sm:py-8">
      <ProgressBar totalSteps={totalSteps} currentStep={currentStep} />
      <QuestionIndicator noOfQuestions={questions?.length} />
      <QuestionsContainer key={currentQuestion.id} question={currentQuestion} />
      <ActionButtons />
    </div>
  );
}

function ProgressBar({ totalSteps = 1, currentStep }) {
  return (
    <div className="flex gap-1 w-full">
      {[...Array(totalSteps)].map((_, index) => (
        <div
          key={index}
          className={`h-1 sm:h-1.5 flex-1 rounded-full transition-colors duration-300 ${
            currentStep >= index ? "bg-green-400" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function QuestionIndicator({ noOfQuestions }) {
  const currentStep = useSurveyStore((state) => state.currentStep);
  const prevStep = useSurveyStore((state) => state.prevStep);
  const noMorePrev = 0 >= currentStep;

  return (
    <div className="flex justify-between items-center">
      {noMorePrev ? (
        <div className="flex-1"></div>
      ) : (
        <div
          className="flex gap-1 sm:gap-2 items-center flex-1 cursor-pointer hover:text-amber-600 transition-colors p-2 -m-2"
          onClick={prevStep}
        >
          <IoIosArrowBack className="size-4 sm:size-5" />
          <p className="text-xs sm:text-sm font-medium">Previous</p>
        </div>
      )}

      <p className="uppercase font-bold font-mono text-center text-amber-400 flex-1 text-xs sm:text-sm">
        question {currentStep + 1} / {noOfQuestions}
      </p>

      <div className="flex-1"></div>
    </div>
  );
}

function QuestionsContainer({ question }) {
  return (
    <div className="flex gap-6 sm:gap-8 flex-col">
      <Questions questionText={question.question_text} />
      <Choices question={question} />
    </div>
  );
}

function Questions({ questionText }) {
  return (
    <div className="text-center px-2">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
        {questionText}
      </h2>
    </div>
  );
}

function Choices({ question }) {
  function renderChoiceType() {
    switch (question?.question_type) {
      case "single":
        return <SingleChoice key={question?.id} question={question} />;
      case "multi":
        return <MultiChoice key={question?.id} question={question} />;
      case "text":
        return <TextInput key={question?.id} question={question} />;
    }
  }
  return (
    <div className="flex flex-col gap-3 sm:gap-4">{renderChoiceType()}</div>
  );
}

function SingleChoice({ question }) {
  const setAnswer = useSurveyStore((state) => state.setAnswer);
  const answers = useSurveyStore((state) => state.answers);

  const currentAnswer = answers[question.id];
  const otherText = currentAnswer?.otherText || "";

  function handleChoiceToggle(choice) {
    if (currentAnswer?.choiceId === choice.id) {
      setAnswer(question.id, null);
    } else {
      const newAnswer = {
        choiceId: choice.id,
        choiceText: choice.choice_text,
      };

      if (choice.is_other === 1 && otherText) {
        newAnswer.otherText = otherText;
      }

      setAnswer(question.id, newAnswer);
    }
  }

  function handleOtherTextChange(e) {
    const value = e.target.value;
    setAnswer(question.id, {
      ...currentAnswer,
      otherText: value,
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {question.choices.map((choice) => (
        <div key={choice?.id} className="flex flex-col gap-2">
          <div
            className="flex items-center gap-3 sm:gap-4 bg-stone-100 py-3 sm:py-4 px-3 sm:px-4 rounded-xl sm:rounded-2xl hover:bg-black/10 cursor-pointer transition-colors min-h-[48px] touch-manipulation"
            onClick={() => handleChoiceToggle(choice)}
          >
            <Checkbox
              checked={currentAnswer?.choiceId === choice.id}
              onChange={() => {}}
              className="bg-white pointer-events-none flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6"
            />
            <p className="select-none font-medium text-sm sm:text-base leading-snug">
              {choice?.choice_text}
            </p>
          </div>

          {choice.is_other === 1 && currentAnswer?.choiceId === choice.id && (
            <div className="ml-4 sm:ml-8 mt-2">
              <Textarea
                placeholder="Please specify..."
                value={otherText}
                onChange={handleOtherTextChange}
                className="min-h-[80px] sm:min-h-[100px] resize-none bg-white border-amber-200 focus:border-amber-400 text-sm sm:text-base"
                rows={3}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MultiChoice({ question }) {
  const setAnswer = useSurveyStore((state) => state.setAnswer);
  const answers = useSurveyStore((state) => state.answers);

  const currentAnswers = answers[question.id] || [];

  function handleChoiceToggle(choice) {
    let newAnswers;

    const existingAnswerIndex = currentAnswers.findIndex(
      (ans) => ans?.choiceId === choice?.id
    );

    if (existingAnswerIndex !== -1) {
      newAnswers = currentAnswers.filter((ans) => ans?.choiceId !== choice?.id);
    } else {
      const newAnswer = {
        choiceId: choice?.id,
        choiceText: choice?.choice_text,
      };
      newAnswers = [...currentAnswers, newAnswer];
    }

    if (
      question.max_selections &&
      newAnswers.length > question.max_selections
    ) {
      toast.error("Maximum Selection Exceeded", {
        description: `Maximum ${question.max_selections} selections allowed!`,
      });
      return;
    }

    setAnswer(question.id, newAnswers);
  }

  function handleOtherTextChange(choiceId, value) {
    const newAnswers = currentAnswers.map((answer) => {
      if (answer.choiceId === choiceId) {
        return { ...answer, otherText: value };
      }
      return answer;
    });

    setAnswer(question.id, newAnswers);
  }

  function isChoiceSelected(choiceId) {
    return currentAnswers.some((ans) => ans?.choiceId === choiceId);
  }

  function getOtherText(choiceId) {
    const answer = currentAnswers.find((ans) => ans?.choiceId === choiceId);
    return answer?.otherText || "";
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {question.choices.map((choice) => (
        <div key={choice?.id} className="flex flex-col gap-2">
          <div
            className="flex items-center gap-3 sm:gap-4 bg-stone-100 py-3 sm:py-4 px-3 sm:px-4 rounded-xl sm:rounded-2xl hover:bg-amber-100 cursor-pointer transition-colors min-h-[48px] touch-manipulation"
            onClick={() => handleChoiceToggle(choice)}
          >
            <Checkbox
              checked={isChoiceSelected(choice?.id)}
              onChange={() => {}}
              className="bg-white pointer-events-none flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6"
            />
            <p className="select-none text-sm sm:text-base leading-snug">
              {choice?.choice_text}
            </p>
          </div>

          {choice.is_other === 1 && isChoiceSelected(choice.id) && (
            <div className="ml-4 sm:ml-8 mt-2">
              <Textarea
                placeholder="Please specify..."
                value={getOtherText(choice.id)}
                onChange={(e) =>
                  handleOtherTextChange(choice.id, e.target.value)
                }
                className="min-h-[80px] sm:min-h-[100px] resize-none bg-white border-amber-200 focus:border-amber-400 text-sm sm:text-base"
                rows={3}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TextInput({ question }) {
  const setAnswer = useSurveyStore((state) => state.setAnswer);
  const answers = useSurveyStore((state) => state.answers);

  const currentAnswer = answers[question.id] || "";

  function handleTextChange(e) {
    const value = e.target.value;
    setAnswer(question.id, value);
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        placeholder="Type your answer here..."
        value={currentAnswer}
        onChange={handleTextChange}
        className="min-h-[120px] sm:min-h-[140px] resize-none text-sm sm:text-base"
        rows={4}
      />
    </div>
  );
}

function ActionButtons() {
  const nextStep = useSurveyStore((state) => state.nextStep);
  const totalSteps = useSurveyStore((state) => state.totalSteps);
  const currentStep = useSurveyStore((state) => state.currentStep);
  const userName = useSurveyStore((state) => state.userName);
  const answers = useSurveyStore((state) => state.answers);
  const setIsSubmitSurvey = useSurveyStore((state) => state.setIsSubmitSurvey);

  const { createResponse, isCreating } = useSurvey();

  const noMoreNext = totalSteps - 1 <= currentStep;
  const isLastStep = totalSteps - 1 === currentStep;

  const validateAnswers = useSurveyStore((state) => state.validateAnswers);
  const { questions } = useSurvey(1, 50);

  function handleSubmit() {
    const validation = validateAnswers(questions);

    if (validation.isComplete) {
      const finalAnswers = Object.entries(answers).flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map((v) => ({
            question_id: key,
            answer_text: v.choiceText,
            ...(v.otherText && { written_answer: v.otherText }),
          }));
        } else {
          return {
            question_id: key,
            answer_text: value.choiceText || value,
            ...(value.otherText && { written_answer: value.otherText }),
          };
        }
      });

      const data = { user_name: userName, answers: finalAnswers };
      console.log("App", data);

      createResponse(data, {
        onSuccess: () => {
          setIsSubmitSurvey(true);
        },
      });

      toast.success("Survey Completed!", {
        description: "All questions answered successfully! 🎉",
        action: {
          onClick: () => console.log("View results clicked"),
        },
      });
    } else {
      toast.error("Incomplete Survey", {
        description: `Please answer ${validation.unansweredQuestions.length} missing questions`,
        action: {
          onClick: () => {
            console.log("Missing questions:", validation.unansweredQuestions);
          },
        },
      });
    }
  }

  return (
    <div className="flex justify-center sm:justify-end pt-4">
      {isLastStep ? (
        <Button
          className="w-full sm:w-auto px-8 sm:px-12 py-3 bg-green-500 hover:bg-green-400 text-base font-medium"
          onClick={handleSubmit}
          disabled={isCreating}
        >
          {isCreating ? "Submitting..." : "Submit Survey "}
        </Button>
      ) : (
        <Button
          className={`w-full sm:w-auto px-8 sm:px-12 py-3 text-base font-medium ${
            noMoreNext && "bg-primary/80"
          }`}
          disabled={noMoreNext}
          onClick={() => nextStep()}
        >
          Next →
        </Button>
      )}
    </div>
  );
}
