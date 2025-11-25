import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CaptchaData } from "../types/unifiedForms";

const fetchCaptcha = async (oldKey?: string): Promise<CaptchaData> => {
    const url = new URL("/api/v1/captcha/refresh/", window.location.origin);
    if (oldKey) {
        url.searchParams.append("old_key", oldKey);
    }

    console.log('Fetching captcha from:', url.toString());
    const response = await fetch(url.toString());

    if (!response.ok) {
        // Check if response is HTML (404 page)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
            throw new Error(`Captcha endpoint not found (${response.status}). Please check the API configuration.`);
        }
        throw new Error(`Failed to fetch captcha: ${response.status} ${response.statusText}`);
    }

    // Try to parse JSON response
    let data;
    try {
        data = await response.json();
    } catch (error) {
        throw new Error("Captcha server returned invalid response. Expected JSON but got something else.");
    }

    console.log('Received captcha data:', {
        key: data.captcha_key,
        imagePrefix: data.captcha_image?.substring(0, 50),
    });

    return {
        key: data.captcha_key,
        image: data.captcha_image,
        timestamp: Date.now(),
    };
};

export const useCaptchaRefresh = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (oldKey?: string) => fetchCaptcha(oldKey),
        onSuccess: (data) => {
            queryClient.setQueryData(["captcha"], data);
        },
    });
};
