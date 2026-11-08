export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

export const clearExpiredAuthSession = (): void => {
    const hadStoredAuth =
        localStorage.getItem("auth_token") !== null ||
        localStorage.getItem("user") !== null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    if (hadStoredAuth) {
        window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
    }
};

export const handleExpiredAuthResponse = async (
    response: Response,
): Promise<boolean> => {
    if (response.status === 401) {
        clearExpiredAuthSession();
        return true;
    }

    if (response.status !== 403) {
        return false;
    }

    try {
        const body: { detail?: unknown } = await response.clone().json();
        if (
            typeof body.detail === "string" &&
            /authentication credentials were not provided|not authenticated|invalid token/i.test(
                body.detail,
            )
        ) {
            clearExpiredAuthSession();
            return true;
        }
    } catch {
        return false;
    }

    return false;
};
