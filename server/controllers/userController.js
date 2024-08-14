const users = [];
const usersInVoice = [];

const addUser = ({ id, name, room }) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();
    
    const existingUser = users.find((user) => user.room === room && user.name === name);

    if (!name || !room) return { success: false, error: 'Username and room are required.' };
    if (existingUser) return { success: false, error: 'Username is taken.' };

    const user = { id, name, room };
    users.push(user);
    return { success: true, user }; 
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) return users.splice(index, 1)[0];
    return null;
}

const getUser = (id) => {
    return users.find((user) => user.id === id);
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room); 
} 

const addUserInVoice = ({ id, name, room }) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();
    const user = { id, name, room };
    usersInVoice.push(user);
    return user; 
}

const removeUserInVoice = (id) => {
    const index = usersInVoice.findIndex((user) => user.id === id);
    if (index !== -1) return usersInVoice.splice(index, 1)[0];
    return null;
}

const getUsersInVoice = (room) => {
    return usersInVoice.filter((user) => user.room === room); 
};

module.exports = { 
    addUser, removeUser, getUser, getUsersInRoom, 
    addUserInVoice, removeUserInVoice, getUsersInVoice 
};
