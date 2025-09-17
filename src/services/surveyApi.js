const surveyApi = {
  baseUrl: "http://102.218.215.254:3030",

  // 📋 QUESTIONS ENDPOINTS
  // GET /questions - Get all questions with their choices
  getAllQuestionsWithChoices: async () => {
    const response = await fetch(`${surveyApi.baseUrl}/questions`);

    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.status}`);
    }

    return response.json();
  },

  // 📊 RESPONSES ENDPOINTS
  // POST /responses - Submit a new survey response
  createResponse: async (responseData) => {
    console.group("🚀 API Request: Create Response");

    // 1. Log request details
    console.log("📤 Request URL:", `${surveyApi.baseUrl}/responses`);
    console.log("📝 Request Method:", "POST");
    console.log("📋 Request Headers:", {
      "Content-Type": "application/json",
    });
    console.log("📦 Request Body (Raw):", responseData);
    console.log(
      "📦 Request Body (JSON):",
      JSON.stringify(responseData, null, 2)
    );
    console.log(
      "📊 Request Body Size:",
      JSON.stringify(responseData).length,
      "bytes"
    );

    try {
      // 2. Log before fetch
      console.log("⏳ Making fetch request...");
      const startTime = Date.now();

      const response = await fetch(`${surveyApi.baseUrl}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(responseData),
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 3. Log response details
      console.log("📥 Response received in", duration, "ms");
      console.log("📊 Response Status:", response.status);
      console.log("📊 Response Status Text:", response.statusText);
      console.log("🌐 Response URL:", response.url);
      console.log(
        "📋 Response Headers:",
        Object.fromEntries(response.headers.entries())
      );
      console.log("✅ Response OK:", response.ok);
      console.log("🔄 Response Redirected:", response.redirected);
      console.log("🔢 Response Type:", response.type);

      // 4. Check if response is ok
      if (!response.ok) {
        console.error("❌ Response not OK!");

        // Try to get error response body
        let errorBody;
        try {
          const contentType = response.headers.get("content-type");
          console.log("🔍 Error Response Content-Type:", contentType);

          if (contentType && contentType.includes("application/json")) {
            errorBody = await response.json();
            console.error("📄 Error Response Body (JSON):", errorBody);
          } else {
            errorBody = await response.text();
            console.error("📄 Error Response Body (Text):", errorBody);
          }
        } catch (parseError) {
          console.error("⚠️ Could not parse error response body:", parseError);
        }

        // Create detailed error
        const error = new Error(
          `Failed to create response: ${response.status} ${response.statusText}`
        );
        error.status = response.status;
        error.statusText = response.statusText;
        error.responseBody = errorBody;

        console.error("💥 Throwing error:", error);
        console.groupEnd();
        throw error;
      }

      // 5. Parse successful response
      console.log("✅ Response is OK, parsing JSON...");
      const data = await response.json();
      console.log("📦 Response Data:", data);
      console.log(
        "📊 Response Data Size:",
        JSON.stringify(data).length,
        "bytes"
      );

      console.log("🎉 Request completed successfully!");
      console.groupEnd();
      return data;
    } catch (error) {
      // 6. Comprehensive error logging
      console.error("💥 REQUEST FAILED!");
      console.error("🔥 Error Type:", error.name);
      console.error("📝 Error Message:", error.message);
      console.error("📚 Error Stack:", error.stack);

      // Network-specific errors
      if (error instanceof TypeError) {
        console.error("🌐 Network Error Details:");
        console.error("   - This is likely a network connectivity issue");
        console.error("   - Check if the server is running");
        console.error("   - Check if the URL is correct");
        console.error("   - Check CORS settings");
        console.error("   - Check internet connection");
      }

      // HTTP errors
      if (error.status) {
        console.error("🔢 HTTP Error Details:");
        console.error("   - Status Code:", error.status);
        console.error("   - Status Text:", error.statusText);
        console.error("   - Response Body:", error.responseBody);

        // Specific status code guidance
        switch (error.status) {
          case 400:
            console.error("   💡 Bad Request - Check request data format");
            break;
          case 401:
            console.error("   💡 Unauthorized - Check authentication");
            break;
          case 403:
            console.error("   💡 Forbidden - Check permissions");
            break;
          case 404:
            console.error("   💡 Not Found - Check endpoint URL");
            break;
          case 422:
            console.error("   💡 Unprocessable Entity - Check data validation");
            break;
          case 500:
            console.error("   💡 Server Error - Check server logs");
            break;
          default:
            console.error("   💡 Unexpected status code");
        }
      }

      console.groupEnd();
      throw error;
    }
  },

  // GET /responses - Get all responses with statistics (paginated)
  getResponsesWithStats: async ({ page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${surveyApi.baseUrl}/responses?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch responses: ${response.status}`);
    }

    return response.json();
  },

  // DELETE /responses/:id - Delete a response by ID
  deleteResponse: async (responseId) => {
    const response = await fetch(
      `${surveyApi.baseUrl}/responses/${responseId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete response: ${response.status}`);
    }

    return response.json();
  },
};

export default surveyApi;
