import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CaptchaData } from "../types/unifiedForms";

const fetchCaptcha = async (oldKey?: string): Promise<CaptchaData> => {
    const url = new URL("/api/v1/captcha/refresh", window.location.origin);
    if (oldKey) {
        url.searchParams.append("old_key", oldKey);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error("Failed to fetch captcha");
    }

    const data = await response.json();
    return {
        key: data.captcha_key,
        image: data.captcha_image,
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
