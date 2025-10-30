import React from "react";
import {
    getPasswordStrengthLevel,
    getPasswordStrengthPercentage,
    getPasswordStrengthColor,
    getPasswordStrengthText,
    PasswordAnalysis,
} from "@/utils/passwordStrength";

interface PasswordStrengthMeterProps {
    analysis: PasswordAnalysis;
}

/**
 * PasswordStrengthMeter component displays a visual strength indicator
 * Shows a colored bar and text indicating password strength
 */
export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
    analysis,
}) => {
    const level = getPasswordStrengthLevel(analysis);
    const percentage = getPasswordStrengthPercentage(analysis);
    const color = getPasswordStrengthColor(level);
    const text = getPasswordStrengthText(level);

    return (
        <div className="password-strength-meter">
            <div className="strength-bar">
                <div
                    className={`strength-fill ${level}`}
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                        transition:
                            "width 0.3s ease, background-color 0.3s ease",
                    }}
                />
            </div>
            <div
                className="strength-text"
                style={{
                    color: level === "none" ? "#6c757d" : color,
                    transition: "color 0.3s ease",
                }}
            >
                {text}
            </div>
        </div>
    );
};
