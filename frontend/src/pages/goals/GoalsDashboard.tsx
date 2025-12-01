import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import GoalsService from '@/services/goalsService';
import GoalCard from '@/components/goals/GoalCard';
import type { GoalListItem, GoalFilters, CheckInFormData } from '@/types/goals';
import '@/styles/goals/GoalsDashboard.css';

const GoalsDashboard: React.FC = () => {
    const [goals, setGoals] = useState<GoalListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<GoalFilters>({ is_active: true });
    const [reminderCount, setReminderCount] = useState(0);

    const fetchGoals = useCallback(async () => {
        try {
            setLoading(true);
            const data: any = await GoalsService.getGoals(filters);
            // support both array responses and paginated responses with `results`
            if (Array.isArray(data)) {
                setGoals(data);
            } else {
                setGoals(data?.results || []);
            }
            setError(null);
        } catch {
            setError('Failed to load goals');
            setGoals([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const fetchReminders = useCallback(async () => {
        try {
            const data = await GoalsService.getReminders();
            setReminderCount(data.count);
        } catch {
            setReminderCount(0);
        }
    }, []);

    useEffect(() => {
        fetchGoals();
        fetchReminders();
    }, [fetchGoals, fetchReminders]);

    useEffect(() => {
        // Refetch goals when returning to the tab
        const handleFocus = () => {
            fetchGoals();
            fetchReminders();
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchGoals, fetchReminders]);

    const handleQuickCheckIn = async (goalId: number) => {
        try {
            const checkInData: CheckInFormData = {
                goal: goalId,
                date: new Date().toISOString().split('T')[0],
                status: 'SUCCESS',
            };
            await GoalsService.createCheckIn(checkInData);
            fetchGoals(); // Refresh goals to update stats
            fetchReminders(); // Update reminder count
        } catch {
            alert('Failed to create check-in. You may have already checked in today.');
        }
    };

    const calculateStats = () => {
        // Safety check: ensure goals is an array
        if (!Array.isArray(goals)) {
            return {
                activeGoals: 0,
                reminderCount: 0,
                avgStreak: 0,
            };
        }

        const activeGoals = goals.filter(g => g.is_active).length;
        const totalStreak = goals.reduce((sum, g) => sum + g.current_streak, 0);
        const avgStreak = activeGoals > 0 ? Math.round(totalStreak / activeGoals) : 0;

        return {
            activeGoals,
            reminderCount,
            avgStreak,
        };
    };

    const stats = calculateStats();

    if (loading) {
        return (
            <div className="goals-dashboard">
                <div className="goals-dashboard-container">
                    <div className="loading-message">Loading goals...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="goals-dashboard">
            <div className="goals-dashboard-container">
                {/* Header */}
                <div className="goals-dashboard-header">
                    <div>
                        <h1 className="goals-dashboard-title">My Goals</h1>
                        <p className="goals-dashboard-subtitle">Track your habits and progress</p>
                    </div>
                    <Link to="/goals/new" className="goals-dashboard-create-btn">
                        <span className="goals-dashboard-create-icon">+</span>
                        Create Goal
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="goals-dashboard-stats">
                    <div className="goals-stat-card">
                        <div className="goals-stat-icon">🎯</div>
                        <div className="goals-stat-content">
                            <div className="goals-stat-value">{stats.activeGoals}</div>
                            <div className="goals-stat-label">Active Goals</div>
                        </div>
                    </div>
                    <div className="goals-stat-card goals-stat-card-highlight">
                        <div className="goals-stat-icon">⏰</div>
                        <div className="goals-stat-content">
                            <div className="goals-stat-value">{stats.reminderCount}</div>
                            <div className="goals-stat-label">Need Check-in Today</div>
                        </div>
                    </div>
                    <div className="goals-stat-card">
                        <div className="goals-stat-icon">🔥</div>
                        <div className="goals-stat-content">
                            <div className="goals-stat-value">{stats.avgStreak}</div>
                            <div className="goals-stat-label">Avg Streak</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="goals-dashboard-filters">
                    <button
                        className={`goals-filter-btn ${filters.is_active === true ? 'active' : ''}`}
                        onClick={() => setFilters({ ...filters, is_active: true })}
                    >
                        Active
                    </button>
                    <button
                        className={`goals-filter-btn ${filters.is_active === false ? 'active' : ''}`}
                        onClick={() => setFilters({ ...filters, is_active: false })}
                    >
                        Archived
                    </button>
                    <button
                        className={`goals-filter-btn ${filters.is_active === undefined ? 'active' : ''}`}
                        onClick={() => setFilters({ ...filters, is_active: undefined })}
                    >
                        All
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="goals-error-message">
                        {error}
                    </div>
                )}

                {/* Goals Grid */}
                {goals.length === 0 ? (
                    <div className="goals-empty-state">
                        <div className="goals-empty-icon">🎯</div>
                        <h2 className="goals-empty-title">No goals yet</h2>
                        <p className="goals-empty-description">
                            Start your journey by creating your first goal
                        </p>
                        <Link to="/goals/new" className="goals-empty-cta">
                            Create Your First Goal
                        </Link>
                    </div>
                ) : (
                    <div className="goals-grid">
                        {Array.isArray(goals) && goals.map(goal => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onQuickCheckIn={handleQuickCheckIn}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoalsDashboard;
