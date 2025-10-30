import { useMutation } from "@tanstack/react-query";

// Contact API functions
const contactApiFunctions = {
    async sendMessage(data: Record<string, string | boolean | File | File[]>) {
        const response = await fetch("/api/v1/contact/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            // Check if response has content before trying to parse JSON
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                try {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message ||
                            `HTTP ${response.status}: ${response.statusText}`,
                    );
                } catch {
                    // If JSON parsing fails, throw a generic error
                    throw new Error(
                        `HTTP ${response.status}: ${response.statusText}`,
                    );
                }
            } else {
                // If not JSON response, throw generic error
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`,
                );
            }
        }

        // Check if response has content before trying to parse JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        } else {
            // If the response is not JSON (like a 204 No Content), return empty object
            return {};
        }
    },
};

// Mutations
export const useSendMessage = () => {
    return useMutation({
        mutationFn: contactApiFunctions.sendMessage,
    });
};
