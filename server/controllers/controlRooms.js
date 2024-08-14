let roomSet = new Set();
let roomQ = []; 

const addRoom = (roomId) => {
    roomSet.add(roomId); 
    roomQ.push({
        roomId: roomId,
        createdAt: new Date()
    });
}

const checkRoomExists = (roomId) => {
    return roomSet.has(roomId); 
}

const deQRoom = () => { 
    while (roomQ.length > 0) {
        let t1 = roomQ[0].createdAt;
        let t2 = new Date(); 
        let diff = t2.getTime() - t1.getTime(); 
        if (diff < 12 * 60 * 60 * 1000) {  // 12 hours in milliseconds
            break;
        }
        console.log("Deleting", roomQ[0].roomId); 
        roomSet.delete(roomQ[0].roomId);
        roomQ.shift();
    }
}

module.exports = {
    addRoom,
    checkRoomExists,
    deQRoom
}
