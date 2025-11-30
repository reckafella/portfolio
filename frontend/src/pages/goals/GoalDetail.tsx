import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import GoalsService from '@/services/goalsService';
import type { Goal, GoalAnalyticsResponse, CheckInFormData } from '@/types/goals';
import '@/styles/goals/GoalDetail.css';

const GoalDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [goal, setGoal] = useState<Goal | null>(null);
    const [analytics, setAnalytics] = useState<GoalAnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGoalData();
    }, [id]);

    const fetchGoalData = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const [goalData, analyticsData] = await Promise.all([
                GoalsService.getGoal(parseInt(id)),
                GoalsService.getGoalAnalytics(parseInt(id)),
            ]);
            setGoal(goalData);
            setAnalytics(analyticsData);
        } catch (err) {
            console.error('Error fetching goal:', err);
            navigate('/goals');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickCheckIn = async (status: 'SUCCESS' | 'FAILURE' | 'SKIPPED') => {
        if (!goal) return;

        try {
            const checkInData: CheckInFormData = {
                goal: goal.id,
                date: new Date().toISOString().split('T')[0],
                status,
            };
            await GoalsService.createCheckIn(checkInData);
            fetchGoalData(); // Refresh data
        } catch (err) {
            console.error('Error creating check-in:', err);
            alert('Failed to create check-in. You may have already checked in today.');
        }
    };

    const handleDelete = async () => {
        if (!goal || !confirm('Are you sure you want to archive this goal?')) return;

        try {
            await GoalsService.deleteGoal(goal.id);
            navigate('/goals');
        } catch (err) {
            console.error('Error deleting goal:', err);
            alert('Failed to archive goal');
        }
    };

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

    if (loading) {
        return <div className="goal-detail-container">Loading...</div>;
    }

    if (!goal || !analytics) {
        return null;
    }

    const categoryColor = getCategoryColor(goal.category);

    return (
        <div className="goal-detail-container">
            <div className="goal-detail-header">
                <Link to="/goals" className="goal-detail-back">← Back to Goals</Link>
                <div className="goal-detail-actions">
                    <Link to={`/goals/${goal.id}/edit`} className="goal-detail-btn goal-detail-btn-edit">
                        Edit
                    </Link>
                    <button onClick={handleDelete} className="goal-detail-btn goal-detail-btn-delete">
                        Archive
                    </button>
                </div>
            </div>

            <div className="goal-detail-content">
                <div className="goal-detail-main">
                    <div className="goal-detail-title-section">
                        <h1 className="goal-detail-title">{goal.title}</h1>
                        <span
                            className="goal-detail-category-badge"
                            style={{ backgroundColor: categoryColor }}
                        >
                            {goal.category.replace('_', ' ')}
                        </span>
                    </div>

                    {goal.description && (
                        <p className="goal-detail-description">{goal.description}</p>
                    )}

                    <div className="goal-detail-meta">
                        <div className="goal-detail-meta-item">
                            <strong>Type:</strong> {goal.goal_type === 'BUILD_HABIT' ? '🎯 Build Habit' : '🚫 Quit Behavior'}
                        </div>
                        <div className="goal-detail-meta-item">
                            <strong>Frequency:</strong> {goal.target_frequency}
                        </div>
                        <div className="goal-detail-meta-item">
                            <strong>Started:</strong> {new Date(goal.start_date).toLocaleDateString()}
                        </div>
                        {goal.target_date && (
                            <div className="goal-detail-meta-item">
                                <strong>Target:</strong> {new Date(goal.target_date).toLocaleDateString()}
                            </div>
                        )}
                    </div>

                    <div className="goal-detail-check-in-section">
                        <h3>Today's Check-in</h3>
                        <div className="goal-detail-check-in-buttons">
                            <button
                                onClick={() => handleQuickCheckIn('SUCCESS')}
                                className="goal-check-in-btn goal-check-in-success"
                            >
                                ✅ Success
                            </button>
                            <button
                                onClick={() => handleQuickCheckIn('FAILURE')}
                                className="goal-check-in-btn goal-check-in-failure"
                            >
                                ❌ Failure
                            </button>
                            <button
                                onClick={() => handleQuickCheckIn('SKIPPED')}
                                className="goal-check-in-btn goal-check-in-skipped"
                            >
                                ⏭️ Skipped
                            </button>
                        </div>
                    </div>

                    <div className="goal-detail-analytics">
                        <h3>Analytics</h3>
                        <div className="goal-detail-stats-grid">
                            <div className="goal-detail-stat-card">
                                <div className="goal-detail-stat-icon">🔥</div>
                                <div className="goal-detail-stat-value">{analytics.analytics.current_streak}</div>
                                <div className="goal-detail-stat-label">Current Streak</div>
                            </div>
                            <div className="goal-detail-stat-card">
                                <div className="goal-detail-stat-icon">🏆</div>
                                <div className="goal-detail-stat-value">{analytics.analytics.longest_streak}</div>
                                <div className="goal-detail-stat-label">Longest Streak</div>
                            </div>
                            <div className="goal-detail-stat-card">
                                <div className="goal-detail-stat-icon">✅</div>
                                <div className="goal-detail-stat-value">{analytics.analytics.total_checkins}</div>
                                <div className="goal-detail-stat-label">Total Check-ins</div>
                            </div>
                            <div className="goal-detail-stat-card">
                                <div className="goal-detail-stat-icon">📊</div>
                                <div className="goal-detail-stat-value">{analytics.analytics.success_rate_overall.toFixed(1)}%</div>
                                <div className="goal-detail-stat-label">Success Rate</div>
                            </div>
                        </div>
                    </div>

                    <div className="goal-detail-history">
                        <h3>Recent Check-ins</h3>
                        <div className="goal-detail-history-grid">
                            {analytics.checkin_history.slice(0, 30).map((checkin, index) => (
                                <div
                                    key={index}
                                    className={`goal-detail-history-item ${checkin.status === 'SUCCESS' ? 'success' :
                                            checkin.status === 'FAILURE' ? 'failure' :
                                                checkin.status === 'SKIPPED' ? 'skipped' :
                                                    'empty'
                                        }`}
                                    title={`${new Date(checkin.date).toLocaleDateString()}: ${checkin.status || 'No check-in'}`}
                                >
                                    {new Date(checkin.date).getDate()}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalDetail;
