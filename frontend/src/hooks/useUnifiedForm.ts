import { useQuery } from "@tanstack/react-query";
import { getApiEndpoint, fetchFormConfig, getFallbackFormConfig } from "@/utils/unifiedFormApis";

const useFormConfig = (formType: string, slug?: string) => {
    const endpoint = getApiEndpoint(formType, slug);
    
    return useQuery({
        queryKey: ['formConfig', formType, slug],
        queryFn: () => fetchFormConfig(endpoint),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
        placeholderData: getFallbackFormConfig(formType)
    });
};

export default useFormConfig;
