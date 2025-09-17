import { create } from "zustand";

export const useSurveyStore = create((set, get) => ({
  answers: {},
  currentStep: 0,
  totalSteps: 0,
  userName: "",
  isBeginSurvey: false,

  setIsBeginSurvey: (bool) => set((state) => ({ isBeginSurvey: bool })),
  setUserName: (name) => set((state) => ({ userName: name })),
  setAnswer: (questionId, value) => {
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: value,
      },
    }));
  },
  setTotalSteps: (steps) => {
    set((state) => ({ totalSteps: steps }));
  },
  nextStep: () => {
    set((state) => {
      if (state.currentStep < state.totalSteps - 1)
        return { currentStep: state.currentStep + 1 };

      return state;
    });
  },
  prevStep: () => {
    set((state) => {
      if (state.currentStep > 0) return { currentStep: state.currentStep - 1 };

      return state;
    });
  },

  validateAnswers: (questions) => {
    const { answers } = get();
    const unansweredQuestions = [];

    questions.forEach((question) => {
      const answer = answers[question.id];

      // Check if question has any answer
      if (!hasValidAnswer(answer, question.question_type)) {
        unansweredQuestions.push({
          id: question.id,
          questionText: question.question_text,
          questionNumber: questions.indexOf(question) + 1,
        });
      }
    });

    return {
      isComplete: unansweredQuestions.length === 0,
      unansweredQuestions,
      totalQuestions: questions.length,
      answeredQuestions: questions.length - unansweredQuestions.length,
    };
  },
}));

function hasValidAnswer(answer, questionType) {
  switch (questionType) {
    case "single":
      if (!answer || !answer.choiceId) return false;
      if (
        answer.choiceId &&
        answer.isOther &&
        (!answer.otherText || answer.otherText.trim() === "")
      ) {
        return false;
      }
      return true;

    case "multi":
      if (!answer || !Array.isArray(answer) || answer.length === 0)
        return false;
      return answer.every((ans) => {
        if (ans.isOther && (!ans.otherText || ans.otherText.trim() === "")) {
          return false;
        }
        return true;
      });

    case "text":
      return answer && answer.trim().length > 0;

    default:
      return false;
  }
}
