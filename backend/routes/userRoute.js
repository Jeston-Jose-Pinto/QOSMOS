const express=require("express");
const User = require("../models/User");
const router=express.Router();
const jwt=require("jsonwebtoken")
// Corrected route logic

router.post("/firebase-login", async (req, res) => {
    const { uid,email,name } = req.body; 

    console.log("getting here");
    
    if (!uid || !email || !name) {
        return res.status(400).json({ success: false, message: "Missing user info" });
    }

    try {

        let user = await User.findById(uid);

        if (!user) {
            user = await User.create({
                _id: uid, 
                email: email || `${uid}@guest.com`,
                name: name || "Quantum User",
            });
        }
        
        
        const authToken = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "your_strong_secret", {
            expiresIn: "1d",
        });

        res.json({ 
            token: authToken, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                stats: user.stats // Include stats for dashboard
            }
        });
    } catch (err) {
        console.log(err.message);
        
        console.error("Firebase Login Error:", err.message);
        res.status(401).json({ success: false, message: "Invalid or expired Firebase token" });
    }
});

router.get('/stats/:userId', async (req, res) => {
    try {

        console.log("getting called");
        
        const userId = req.params.userId;
        
        // Find the user document by the userId (which is stored as the _id in MongoDB)
        const user = await User.findById(userId)
            .select('name email stats'); // Only select the fields needed for the dashboard


            console.log(user);
            
        if (!user) {
            // If the user is authenticated but hasn't hit the signup route yet, 
            // return a default stats object (or force them through the signup route)
            return res.status(200).json({ 
                stats: { 
                    circuitsCreated: 0, 
                    gatesUsed: 0, 
                    simulationsRun: 0, 
                    codeExports: 0 
                } 
            });
        }

        res.json({
            name: user.name,
            email: user.email,
            stats: user.stats
        });
    } catch (error) {
        console.error("Error fetching user stats:", error.message);
        res.status(500).json({ message: 'Failed to fetch user statistics', error: error.message });
    }
});

module.exports = router;


router.put('/stats/increment/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Use $inc operator to atomically increase the simulation count by 1
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                $inc: { "stats.simulationsRun": 1 } 
            },
            { new: true, select: 'stats' } // Return the updated stats only
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found or unable to update' });
        }

        res.json({
            message: 'Simulation count incremented successfully',
            stats: updatedUser.stats
        });

    } catch (error) {
        console.error("Error incrementing simulation count:", error.message);
        res.status(500).json({ message: 'Failed to update simulation count', error: error.message });
    }
});