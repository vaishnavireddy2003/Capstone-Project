import React, { useState, useEffect, useContext, } from 'react';
import axios from 'axios';
import ScrumDetails from '../ScrumDetails/ScrumDetails';
import { UserContext } from '../../context/UserContext';
import './dashboard.css';

const Dashboard = () => {
    const [scrums, setScrums] = useState([]);
    const [selectedScrum, setSelectedScrum] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [users, setUsers] = useState([]);
    const [newScrumName, setNewScrumName] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskStatus, setNewTaskStatus] = useState('To Do');
    const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [scrumsRes, usersRes] = await Promise.all([
                    axios.get('http://localhost:4000/scrums'),
                    axios.get('http://localhost:4000/users')
                ]);
                setScrums(scrumsRes.data);
                setUsers(usersRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleGetDetails = async (scrumId) => {
        try {
            const { data } = await axios.get(`http://localhost:4000/scrums/${scrumId}`);
            setSelectedScrum(data);

        } catch (error) {
            console.error('Error fetching scrum details:', error);
        }
    };

    const handleAddScrum = async (event) => {
        event.preventDefault();

        try {
            // Add new Scrum
            const { data: newScrum } = await axios.post('http://localhost:4000/scrums', {
                name: newScrumName,
            });

            // Add new Task
            await axios.post('http://localhost:4000/tasks', {
                title: newTaskTitle,
                description: newTaskDescription,
                status: newTaskStatus,
                scrumId: newScrum.id,
                assignedTo: newTaskAssignedTo,
                history: [
                    {
                        status: newTaskStatus,
                        date: new Date().toISOString().split('T')[0], // Current date
                    },
                ],
            });

            // Update state instead of re-fetching all scrums
            setScrums([...scrums, newScrum]);

            // Reset form fields and clear previously selected Scrum
            setShowForm(false);
            setNewScrumName('');
            setNewTaskTitle('');
            setNewTaskDescription('');
            setNewTaskStatus('To Do');
            setNewTaskAssignedTo('');
            setSelectedScrum(null); // Clear previously selected scrum
        } catch (error) {
            console.error('Error adding scrum:', error);
        }
    };

    return (
        <div className="dashboard-container">
            <h2>Scrum Teams</h2>
            {user?.role === 'admin' && (
                <div className="form-container">
                    <button className="toggle-button" onClick={() => { setShowForm(!showForm); setSelectedScrum(null); }}>
                        {showForm ? 'Cancel' : 'Add New Scrum'}
                    </button>
                    {showForm && (
                        <form className="scrum-form" onSubmit={handleAddScrum}>
                            <div>
                                <label>Scrum Name:</label>
                                <input
                                    type="text"
                                    value={newScrumName}
                                    onChange={(e) => setNewScrumName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Task Title:</label>
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Task Description:</label>
                                <input
                                    type="text"
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Task Status:</label>
                                <select
                                    value={newTaskStatus}
                                    onChange={(e) => setNewTaskStatus(e.target.value)}
                                    required
                                >
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                            <div>
                                <label>Assign To:</label>
                                <select
                                    value={newTaskAssignedTo}
                                    onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                                    required
                                >
                                    <option value="">Select a user</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button className="submit-button" type="submit">Create Scrum</button>
                        </form>
                    )}
                </div>
            )}
            <ul className="scrum-list">
                {scrums.map((scrum) => (
                    <li key={scrum.id} className="scrum-item">
                        {scrum.name}
                        <button className="details-button" onClick={() => handleGetDetails(scrum.id)}>Get Details</button>
                    </li>
                ))}
            </ul>
            {selectedScrum && <ScrumDetails scrum={selectedScrum} />}
        </div>
    );
};

export default Dashboard;