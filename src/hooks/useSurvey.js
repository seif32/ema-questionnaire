import surveyApi from "@/services/surveyApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const useSurvey = (page = 1, limit = 10) => {
  const queryClient = useQueryClient();

  const queryKeys = {
    // 📋 Questions
    questions: "questions",
    allQuestions: ["questions", "all"],

    // 📊 Responses
    responses: "responses",
    responsesWithStats: ["responses", "withStats", page, limit],

    // 🎯 Combined Survey
    survey: "survey",
    allSurveyData: ["survey", "all", page, limit],
  };

  // 📋 QUESTIONS QUERY
  const questionsQuery = useQuery({
    queryKey: queryKeys.allQuestions,
    queryFn: surveyApi.getAllQuestionsWithChoices,
    staleTime: 10 * 60 * 1000, // 10 minutes (questions don't change often)
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });

  // 📊 RESPONSES QUERY
  const responsesQuery = useQuery({
    queryKey: queryKeys.responsesWithStats,
    queryFn: () => surveyApi.getResponsesWithStats({ page, limit }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // ✅ CREATE RESPONSE MUTATION
  const createResponseMutation = useMutation({
    mutationFn: surveyApi.createResponse,
    onSuccess: () => {
      // Invalidate all response-related queries
      queryClient.invalidateQueries({ queryKey: [queryKeys.responses] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.survey] });
    },
    onError: (error) => {
      console.error("Failed to create response:", error);
    },
  });

  // 🗑️ DELETE RESPONSE MUTATION
  const deleteResponseMutation = useMutation({
    mutationFn: surveyApi.deleteResponse,
    onSuccess: () => {
      // Invalidate all response-related queries
      queryClient.invalidateQueries({ queryKey: [queryKeys.responses] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.survey] });
    },
    onError: (error) => {
      console.error("Failed to delete response:", error);
    },
  });

  return {
    // 📋 QUESTIONS DATA & STATES
    questions: questionsQuery.data,
    questionsLoading: questionsQuery.isLoading,
    questionsFetching: questionsQuery.isFetching,
    questionsError: questionsQuery.isError,
    questionsErrorDetails: questionsQuery.error,
    questionsSuccess: questionsQuery.isSuccess,

    // 📊 RESPONSES DATA & STATES
    responses: responsesQuery.data,
    responsesLoading: responsesQuery.isLoading,
    responsesFetching: responsesQuery.isFetching,
    responsesError: responsesQuery.isError,
    responsesErrorDetails: responsesQuery.error,
    responsesSuccess: responsesQuery.isSuccess,

    // 🎯 COMBINED LOADING STATES
    isLoading: questionsQuery.isLoading || responsesQuery.isLoading,
    isFetching: questionsQuery.isFetching || responsesQuery.isFetching,
    isError: questionsQuery.isError || responsesQuery.isError,
    isSuccess: questionsQuery.isSuccess && responsesQuery.isSuccess,

    // 🔄 QUERY METHODS
    refetchQuestions: questionsQuery.refetch,
    refetchResponses: responsesQuery.refetch,
    refetchAll: () => {
      questionsQuery.refetch();
      responsesQuery.refetch();
    },

    // ✅ CREATE RESPONSE
    createResponse: createResponseMutation.mutate,
    createResponseAsync: createResponseMutation.mutateAsync,
    isCreating: createResponseMutation.isPending,
    createSuccess: createResponseMutation.isSuccess,
    createError: createResponseMutation.error,
    resetCreateMutation: createResponseMutation.reset,

    // 🗑️ DELETE RESPONSE
    deleteResponse: deleteResponseMutation.mutate,
    deleteResponseAsync: deleteResponseMutation.mutateAsync,
    isDeleting: deleteResponseMutation.isPending,
    deleteSuccess: deleteResponseMutation.isSuccess,
    deleteError: deleteResponseMutation.error,
    resetDeleteMutation: deleteResponseMutation.reset,

    // 🎛️ UTILITY METHODS
    invalidateQuestions: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.questions] });
    },
    invalidateResponses: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.responses] });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.questions] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.responses] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.survey] });
    },

    // 🚀 PREFETCH METHODS
    prefetchQuestions: () => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.allQuestions,
        queryFn: surveyApi.getAllQuestionsWithChoices,
      });
    },
    prefetchResponses: (prefetchPage = 1, prefetchLimit = 10) => {
      queryClient.prefetchQuery({
        queryKey: ["responses", "withStats", prefetchPage, prefetchLimit],
        queryFn: () =>
          surveyApi.getResponsesWithStats({
            page: prefetchPage,
            limit: prefetchLimit,
          }),
      });
    },
    prefetchAll: (prefetchPage = 1, prefetchLimit = 10) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.allQuestions,
        queryFn: surveyApi.getAllQuestionsWithChoices,
      });
      queryClient.prefetchQuery({
        queryKey: ["responses", "withStats", prefetchPage, prefetchLimit],
        queryFn: () =>
          surveyApi.getResponsesWithStats({
            page: prefetchPage,
            limit: prefetchLimit,
          }),
      });
    },

    // 📝 SET QUERY DATA METHODS
    setQuestionsData: (newData) => {
      queryClient.setQueryData(queryKeys.allQuestions, newData);
    },
    setResponsesData: (newData) => {
      queryClient.setQueryData(queryKeys.responsesWithStats, newData);
    },

    // 🎯 PAGINATION HELPERS
    currentPage: page,
    currentLimit: limit,
    hasNextPage: responsesQuery.data?.hasNextPage,
    hasPreviousPage: responsesQuery.data?.hasPreviousPage,
    totalPages: responsesQuery.data?.totalPages,
    totalResponses: responsesQuery.data?.totalResponses,
  };
};

export default useSurvey;
