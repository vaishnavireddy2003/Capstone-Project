import React, { useState, useEffect, useContext, } from 'react';
import axios from 'axios';
import ScrumDetails from '../ScrumDetails/ScrumDetails';
import { UserContext } from '../../context/UserContext';
import './dashboard.css';

const Dashboard = () => {
    const [scrums, setScrums] = useState([]); //Stores the list of Scrum teams
    const [selectedScrum, setSelectedScrum] = useState(null); //Stores details of the selected Scrum team
    const [showForm, setShowForm] = useState(false); //Toggles the Scrum creation form (visible only to admins)
    const [users, setUsers] = useState([]); //Stores the list of users (for assigning tasks)
    const [newScrumName, setNewScrumName] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskStatus, setNewTaskStatus] = useState('To Do');
    const [newTaskAssignedTo, setNewTaskAssignedTo] = useState(''); //Used to handle form inputs
    const { user } = useContext(UserContext);

    //Data Fetching
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

        fetchData(); //Fetches Scrum teams and users from a local API
    }, []);

    //Viewing Scrum Details
    const handleGetDetails = async (scrumId) => {
        try {
            const { data } = await axios.get(`http://localhost:4000/scrums/${scrumId}`);
            setSelectedScrum(data); 

        } catch (error) {
            console.error('Error fetching scrum details:', error);
        }
    };

    //Adding a New Scrum
    const handleAddScrum = async (event) => {
        event.preventDefault();

        try {
            const { data: newScrum } = await axios.post('http://localhost:4000/scrums', {
                name: newScrumName,
            });

            await axios.post('http://localhost:4000/tasks', {
                title: newTaskTitle,
                description: newTaskDescription,
                status: newTaskStatus,
                scrumId: newScrum.id,
                assignedTo: newTaskAssignedTo,
                history: [
                    {
                        status: newTaskStatus,
                        date: new Date().toISOString().split('T')[0],
                    },
                ],
            });

            setScrums([...scrums, newScrum]);
            setShowForm(false);
            setNewScrumName('');
            setNewTaskTitle('');
            setNewTaskDescription('');
            setNewTaskStatus('To Do');
            setNewTaskAssignedTo('');
            setSelectedScrum(null);
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