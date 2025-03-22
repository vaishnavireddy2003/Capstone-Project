import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import './userprofile.css';

const UserProfile = () => {
    const [users, setUsers] = useState([]); // Stores the list of all users (excluding admins)
    const [tasks, setTasks] = useState([]); //Stores tasks assigned to a selected user
    const [selectedUser, setSelectedUser] = useState(null); //Stores the currently selected user for viewing task history
    const [showForm, setShowForm] = useState(false); //Controls visibility of the "Add User" form (Admin only)
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('employee'); // Stores form input values for adding a new user
    const { user } = useContext(UserContext);

    //Fetching User & Task Data
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4000/users');
                if (user?.role === 'admin') {
                    setUsers(response.data.filter(user => user?.role !== 'admin'));
                } else {
                    setSelectedUser(user);
                    fetchTasks(user?.id);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, [user]);

    //Fetch Tasks for a User
    const fetchTasks = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:4000/tasks?assignedTo=${userId}`);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    //Viewing Task History
    const handleGetHistory = (userId) => {
        setSelectedUser(users.find(user => user?.id === userId));
        fetchTasks(userId);
    };

    //Adding a New User 
    const handleAddUser = async (event) => {
        event.preventDefault();

        try {
            await axios.post('http://localhost:4000/users', {
                name: newUserName,
                email: newUserEmail,
                password: newUserPassword,
                role: newUserRole,
            });

            const updatedUsers = await axios.get('http://localhost:4000/users');
            setUsers(updatedUsers.data.filter(user => user?.role !== 'admin'));
            setShowForm(false);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
            setSelectedUser(null);
            setNewUserRole('employee');
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    return (
        <div className="userprofile-container">
            <h2 className="heading">User Profiles</h2>
            {user?.role === 'admin' && (
                <div className="container">
                    <button className="toggle-button" onClick={() => { setShowForm(!showForm); setSelectedUser(null); }} >
                        {showForm ? 'Cancel' : 'Add New User'}
                    </button>
                    {showForm && (
                        <form className="user-form" onSubmit={handleAddUser}>
                            <div>
                                <label>Name:</label>
                                <input
                                    type="text"
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Password:</label>
                                <input
                                    type="password"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Role:</label>
                                <select
                                    value={newUserRole}
                                    onChange={(e) => setNewUserRole(e.target.value)}
                                    required
                                >
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button className="submit-button" type="submit">Create User</button>
                        </form>
                    )}
                </div>
            )}
                    <ul className="user-list">
                        {users.map(user => (
                            <li key={user?.id} className="user-card">
                                <div className="user-info">
                                <strong>Name:</strong> {user?.name} <br />
                                <strong>Email:</strong> {user?.email} <br />
                                </div>
                                <button className="detail-button" onClick={() => handleGetHistory(user?.id)}>Get History</button>
                            </li>
                        ))}
                    </ul>


            {user?.role !== 'admin' && (
                <div>
                    <h3>Tasks Worked By {user?.name}</h3>
                    <ul style={{ listStylePosition: "inside", paddingLeft: 0 }}>
                        {tasks.map(task => (
                            <li key={task.id}>
                                <strong>Title:</strong> {task.title} <br />
                                <strong>Description:</strong> {task.description} <br />
                                <strong>Status:</strong> {task.status}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {selectedUser && user?.role === 'admin' && (
                <div>
                    <h3>Tasks Worked By {selectedUser.name}</h3>
                    <ul style={{ listStylePosition: "inside", paddingLeft: 0 }}>
                        {tasks.map(task => (
                            <li key={task.id} style={{ marginBottom: "10px" }}>
                                <strong>Title:</strong> {task.title} <br />
                                <strong>Description:</strong> {task.description} <br />
                                <strong>Status:</strong> {task.status}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
