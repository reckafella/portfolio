import React from 'react';
import { Link } from 'react-router-dom';
import type { GoalListItem } from '@/types/goals';
import '@/styles/goals/GoalCard.css';

interface GoalCardProps {
    goal: GoalListItem;
    onQuickCheckIn?: (goalId: number) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onQuickCheckIn }) => {
    const getCategoryColor = (category: string): string => {
        const colors: Record<string, string> = {
            HEALTH: '#22c55e',
            PRODUCTIVITY: '#3b82f6',
            SOCIAL: '#ec4899',
            PERSONAL_DEVELOPMENT: '#a855f7',
            OTHER: '#64748b',
        };
        return colors[category] || colors.OTHER;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const calculateProgress = (): number => {
        if (!goal.target_date) return 0;

        const start = new Date(goal.start_date).getTime();
        const target = new Date(goal.target_date).getTime();
        const now = Date.now();

        const total = target - start;
        const elapsed = now - start;

        return Math.min(100, Math.max(0, (elapsed / total) * 100));
    };

    const categoryColor = getCategoryColor(goal.category);
    const progress = calculateProgress();

    return (
        <div className="goal-card">
            <div className="goal-card-header">
                <div className="goal-card-title-row">
                    <Link to={`/goals/${goal.id}`} className="goal-card-title">
                        {goal.title}
                    </Link>
                    <span
                        className="goal-card-category-badge"
                        style={{ backgroundColor: categoryColor }}
                    >
                        {goal.category.replace('_', ' ')}
                    </span>
                </div>
                <div className="goal-card-type">
                    {goal.goal_type === 'BUILD_HABIT' ? '🎯 Build Habit' : '🚫 Quit Behavior'}
                </div>
            </div>

            <div className="goal-card-stats">
                <div className="goal-card-stat">
                    <div className="goal-card-stat-icon">🔥</div>
                    <div className="goal-card-stat-content">
                        <div className="goal-card-stat-value">{goal.current_streak}</div>
                        <div className="goal-card-stat-label">Day Streak</div>
                    </div>
                </div>

                <div className="goal-card-stat">
                    <div className="goal-card-stat-icon">✅</div>
                    <div className="goal-card-stat-content">
                        <div className="goal-card-stat-value">{goal.checkin_count}</div>
                        <div className="goal-card-stat-label">Check-ins</div>
                    </div>
                </div>
            </div>

            {goal.target_date && (
                <div className="goal-card-progress">
                    <div className="goal-card-progress-header">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="goal-card-progress-bar">
                        <div
                            className="goal-card-progress-fill"
                            style={{ width: `${progress}%`, backgroundColor: categoryColor }}
                        />
                    </div>
                    <div className="goal-card-progress-dates">
                        <span>{formatDate(goal.start_date)}</span>
                        <span>{formatDate(goal.target_date)}</span>
                    </div>
                </div>
            )}

            <div className="goal-card-actions">
                <button
                    className="goal-card-check-in-btn"
                    onClick={() => onQuickCheckIn?.(goal.id)}
                    style={{ borderColor: categoryColor, color: categoryColor }}
                >
                    Quick Check-in
                </button>
                <Link to={`/goals/${goal.id}`} className="goal-card-view-btn">
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default GoalCard;
