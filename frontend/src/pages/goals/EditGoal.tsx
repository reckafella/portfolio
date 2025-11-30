import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GoalsService from '@/services/goalsService';
import GoalForm from '@/components/goals/GoalForm';
import type { Goal } from '@/types/goals';

const EditGoal: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [goal, setGoal] = useState<Goal | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGoal = async () => {
            if (!id) {
                navigate('/goals');
                return;
            }

            try {
                const data = await GoalsService.getGoal(parseInt(id));
                setGoal(data);
            } catch (err) {
                console.error('Error fetching goal:', err);
                navigate('/goals');
            } finally {
                setLoading(false);
            }
        };

        fetchGoal();
    }, [id, navigate]);

    if (loading) {
        return <div className="goal-form-container">Loading...</div>;
    }

    if (!goal) {
        return null;
    }

    return (
        <GoalForm
            initialData={{
                title: goal.title,
                description: goal.description,
                goal_type: goal.goal_type,
                category: goal.category,
                target_frequency: goal.target_frequency,
                start_date: goal.start_date,
                target_date: goal.target_date,
                is_private: goal.is_private,
            }}
            isEditing={true}
            goalId={goal.id}
        />
    );
};

export default EditGoal;
