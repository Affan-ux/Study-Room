const express = require("express");
const router = express.Router();
const { generateRoomId } = require("../controllers/generateRoomId"); 
const controlRooms = require("../controllers/controlRooms"); 

router.get("/generateRoomId", async (req, res) => {
    try {
        const roomId = await generateRoomId();
        res.status(200).json({
            success: true,
            roomId  
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to generate room ID",
            error: error.message
        });
    }
});

router.get("/checkRoomExists/:roomId", async (req, res) => {
    try {
        const id = req.params.roomId; 
        const exists = controlRooms.checkRoomExists(id);

        res.status(200).json({
            success: true,
            exists  
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to check if room exists",
            error: error.message
        });
    }
});

module.exports = router;
