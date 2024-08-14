const randomstring = require("randomstring");
const controlRooms = require("./controlRooms"); 

const generateRoomId = () => {
    let gen;
    do {
        gen = randomstring.generate(10).toLowerCase();
    } while (controlRooms.checkRoomExists(gen));
    
    controlRooms.addRoom(gen); 
    return gen; 
}

module.exports = {
    generateRoomId 
}
