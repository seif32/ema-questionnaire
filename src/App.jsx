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
  return (
    <QueryClientProvider client={queryClient}>
      <main className=" min-h-screen grid place-items-center">
        {isBeginSurvey ? <SurveyContainer /> : <SetName />}
      </main>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

export default App;

function SetName() {
  const userName = useSurveyStore((state) => state.userName);
  const setUserName = useSurveyStore((state) => state.setUserName);
  const setIsBeginSurvey = useSurveyStore((state) => state.setIsBeginSurvey);

  const isValidName =
    userName.trim().length >= 2 &&
    userName.trim().length <= 50 &&
    /^[a-zA-Z\s]+$/.test(userName);

  return (
    <div className="space-y-3 flex flex-col">
      <div className="w-100 self-center justify-self-center">
        <img
          src={Smile}
          alt="smile-face"
          className="object-fill w-full h-full"
        />
      </div>
      <div>
        <h2 className="text-muted-foreground">Hello our dear!</h2>
        <h1 className="text-4xl">
          Please write your name, to begin the survey
        </h1>
      </div>
      <Input value={userName} onChange={(e) => setUserName(e.target.value)} />
      <Button
        disabled={!isValidName}
        className={" self-end"}
        onClick={() => setIsBeginSurvey(true)}
      >
        Begin
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

  if (questionsLoading) return <div>Loading . . .</div>;
  if (questionsError) {
    return <div>Error loading questions: {questionsErrorDetails?.message}</div>;
  }
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return <div>No questions available</div>;
  }
  if (totalSteps === 0) {
    return <div>Initializing survey...</div>;
  }
  const currentQuestion = questions[currentStep];

  if (!currentQuestion) {
    return <div>Question not found</div>;
  }

  return (
    <div className="flex flex-col gap-y-4 max-w-150 py-20 ">
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
          className={`h-1 flex-1 rounded-full bg-gray-400 ${
            currentStep >= index && "bg-green-400 transition-colors"
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
    <div className="flex justify-between">
      {noMorePrev ? (
        <div className="flex-1"></div>
      ) : (
        <div
          className="flex gap-1 items-center flex-1 cursor-pointer hover:text-amber-600"
          onClick={prevStep}
        >
          <IoIosArrowBack className="size-4" />
          <p className="text-xs">Previous</p>
        </div>
      )}
      <p className="uppercase font-bold font-mono text-center  text-amber-400 flex-1">
        question {currentStep + 1} / {noOfQuestions}
      </p>
      <div className="flex-1"></div>
    </div>
  );
}

function QuestionsContainer({ question }) {
  return (
    <div className=" flex gap-8 flex-col">
      <Questions questionText={question.question_text} />
      <Choices question={question} />
    </div>
  );
}

function Questions({ questionText }) {
  return (
    <div className=" text-center">
      <h2 className="text-5xl">{questionText}</h2>
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
  return <div className=" flex flex-col gap-2">{renderChoiceType()}</div>;
}

function SingleChoice({ question }) {
  const setAnswer = useSurveyStore((state) => state.setAnswer);
  const answers = useSurveyStore((state) => state.answers);

  const currentAnswer = answers[question.id];
  const otherText = currentAnswer?.otherText || "";
  // const selectedChoice = currentAnswer?.choiceId;

  // const selectedChoiceData = question.choices.find(
  //   (choice) => choice.id === selectedChoice
  // );
  // const isOtherSelected = selectedChoiceData?.is_other === 1;

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
    <div className="flex flex-col gap-3">
      {question.choices.map((choice) => (
        <div key={choice?.id} className="flex flex-col gap-2">
          <div
            className="flex items-center gap-3 bg-stone-100 py-3 px-2 rounded-2xl hover:bg-black/20 cursor-pointer transition-colors"
            onClick={() => handleChoiceToggle(choice)}
          >
            <Checkbox
              checked={currentAnswer?.choiceId === choice.id}
              onChange={() => {}}
              className="bg-white pointer-events-none"
            />
            <p className="select-none font-medium">{choice?.choice_text}</p>
          </div>

          {choice.is_other === 1 && currentAnswer?.choiceId === choice.id && (
            <div className="ml-8 mt-2">
              <Textarea
                placeholder="Please specify..."
                value={otherText}
                onChange={handleOtherTextChange}
                className="min-h-[80px] resize-none bg-white border-amber-200 focus:border-amber-400"
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
    <div className="flex flex-col gap-3">
      {question.choices.map((choice) => (
        <div key={choice?.id} className="flex flex-col gap-2">
          <div
            className="flex items-center gap-3 bg-stone-100 py-3 px-2 rounded-2xl hover:bg-amber-100 cursor-pointer transition-colors"
            onClick={() => handleChoiceToggle(choice)}
          >
            <Checkbox
              checked={isChoiceSelected(choice?.id)}
              onChange={() => {}}
              className="bg-white pointer-events-none"
            />
            <p className="select-none">{choice?.choice_text}</p>
          </div>

          {/* ✅ Conditional textarea for "other" options */}
          {choice.is_other === 1 && isChoiceSelected(choice.id) && (
            <div className="ml-8 mt-2">
              <Textarea
                placeholder="Please specify..."
                value={getOtherText(choice.id)}
                onChange={(e) =>
                  handleOtherTextChange(choice.id, e.target.value)
                }
                className="min-h-[80px] resize-none bg-white border-amber-200 focus:border-amber-400"
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
        className="min-h-[120px] resize-none"
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

  const { createResponse, isCreating } = useSurvey();

  const noMoreNext = totalSteps - 1 <= currentStep;
  const isLastStep = totalSteps - 1 === currentStep;

  const validateAnswers = useSurveyStore((state) => state.validateAnswers);
  const { questions } = useSurvey(1, 50);

  function handleSubmit() {
    const validation = validateAnswers(questions);

    if (validation.isComplete) {
      const finalAnswers = Object.entries(answers).map(([key, value]) => {
        const answerText = Array.isArray(value)
          ? value.map((v) => v.choiceText)
          : value.choiceText;

        const writtenAnswer = Array.isArray(value)
          ? value.find((v) => v.otherText)?.otherText
          : value.otherText;

        return {
          question_id: key,
          answer_text: answerText,
          ...(writtenAnswer && { written_answer: writtenAnswer }),
        };
      });

      const data = { user_name: userName, answers: finalAnswers };

      createResponse(data);

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
    <div className="flex justify-end">
      {isLastStep ? (
        <Button
          className="px-15 bg-green-500 hover:bg-green-400"
          onClick={handleSubmit}
          disabled={isCreating}
        >
          Submit
        </Button>
      ) : (
        <Button
          className={`px-15 ${noMoreNext && "bg-primary/80"}`}
          disabled={noMoreNext}
          onClick={() => nextStep()}
        >
          Next
        </Button>
      )}
    </div>
  );
}
