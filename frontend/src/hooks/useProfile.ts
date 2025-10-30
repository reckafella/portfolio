import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProfileService, {
    ProfileData,
    ProfileUpdateData,
    PasswordChangeData,
    SettingsData,
} from "@/services/profileService";

// Query keys
export const profileKeys = {
    all: ["profile"] as const,
    detail: () => [...profileKeys.all, "detail"] as const,
    settings: () => [...profileKeys.all, "settings"] as const,
};

/**
 * Hook to fetch current user's profile
 */
export const useProfile = () => {
    return useQuery({
        queryKey: profileKeys.detail(),
        queryFn: () => ProfileService.getProfile(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });
};

/**
 * Hook to update profile
 */
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ProfileUpdateData) =>
            ProfileService.updateProfile(data),
        onSuccess: (response) => {
            // Update the profile cache with new data
            queryClient.setQueryData(profileKeys.detail(), response.profile);
            // Also update user data in localStorage
            const currentUser = localStorage.getItem("user");
            if (currentUser) {
                const user = JSON.parse(currentUser);
                const updatedUser = {
                    ...user,
                    first_name: response.profile.user.first_name,
                    last_name: response.profile.user.last_name,
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
            }
        },
    });
};

/**
 * Hook to change password
 */
export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: PasswordChangeData) =>
            ProfileService.changePassword(data),
    });
};

/**
 * Hook to fetch user settings
 */
export const useSettings = () => {
    return useQuery({
        queryKey: profileKeys.settings(),
        queryFn: () => ProfileService.getSettings(),
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};

/**
 * Hook to update settings
 */
export const useUpdateSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SettingsData) => ProfileService.updateSettings(data),
        onSuccess: (response) => {
            // Update the settings cache
            queryClient.setQueryData(profileKeys.settings(), response.settings);
        },
    });
};

/**
 * Hook to upload profile image
 */
export const useUploadProfileImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => ProfileService.uploadProfileImage(file),
        onSuccess: () => {
            // Invalidate profile to refetch with new image
            queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
        },
    });
};

/**
 * Hook to delete profile image
 */
export const useDeleteProfileImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => ProfileService.deleteProfileImage(),
        onSuccess: () => {
            // Invalidate profile to refetch without image
            queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
        },
    });
};
