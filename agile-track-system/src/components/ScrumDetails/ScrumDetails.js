import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const ScrumDetails = ({ scrum }) => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedInUser) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        setTasks([]);
        setUsers([]);

        if (!scrum?.id) return;

        const fetchScrumData = async () => {
            try {
                const tasksResponse = await axios.get(`http://localhost:4000/tasks?scrumId=${scrum.id}`);
                const tasksData = tasksResponse.data;
                setTasks(tasksData);

                const usersResponse = await axios.get("http://localhost:4000/users");
                const usersData = usersResponse.data;

                const assignedUsers = usersData.filter(user =>
                    tasksData.some(task => Number(task.assignedTo) === Number(user.id))
                );

                setUsers(assignedUsers);
            } catch (error) {
                console.error('Error fetching scrum details:', error);
            }
        };

        fetchScrumData();
    }, [scrum?.id]);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const updatedTask = tasks.find(task => task.id === taskId);
            if (!updatedTask) return;

            const updatedHistory = [
                ...updatedTask.history,
                { status: newStatus, date: new Date().toISOString().split('T')[0] }
            ];

            await axios.patch(`http://localhost:4000/tasks/${taskId}`, {
                status: newStatus,
                history: updatedHistory,
            });

            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, status: newStatus, history: updatedHistory } : task
                )
            );
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    if (!scrum) {
        return <p>Loading scrum details...</p>;
    }

    return (
        <div className="scrum-container">
            <h3>Scrum Details for {scrum.name}</h3>
            <h4>Tasks</h4>
            <ul className="task-list">
                {tasks.map(task => (
                    <li key={task.id} className="task-item">
                        <strong>{task.title}:</strong> {task.description} - <em>{task.status}</em>
                        {user?.role === 'admin' && (
                            <span style={{ marginLeft: "10px" }}>
                            <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                className="status-dropdown"
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                            </span>
                        )}
                    </li>
                ))}
            </ul>
            <h4>Users</h4>
            <ul>
                {users.length > 0 ? (
                    users.map(user => (
                        <li key={user.id} >
                            {user.name} ({user.email})
                        </li>
                    ))
                ) : (
                    <p>No employees assigned to this scrum.</p>
                )}
            </ul>
        </div>
    );
};

export default ScrumDetails;
