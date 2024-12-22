import connectDB from "../database/db.js";

export const sendMessage = async (req, res) => {
    try {
        // Connect to the database
        const db = await connectDB();

        // Extract sender ID, chatroom ID, content, and timestamp
        const senderId = req.id; // Assuming middleware adds req.id
        const chatroomId = req.params.id;
        const { content, timestamp } = req.body;

        // Validate input
        if (!content) {
            return res.status(400).json({ error: "Content is required." });
        }

        // Generate or validate the timestamp
        let formattedTimestamp;
        const now = new Date();
        if (!timestamp) {
            formattedTimestamp = now.toISOString().slice(0, 19).replace('T', ' '); // Full datetime in UTC
        } else {
            const timeFormat = /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
            if (!timeFormat.test(timestamp)) {
                return res.status(400).json({ error: "Invalid timestamp format. Use HH:MM:SS." });
            }
            const currentDate = now.toISOString().split('T')[0]; // Get current date in YYYY-MM-DD
            formattedTimestamp = `${currentDate} ${timestamp}`; // Combine date with time
        }

        // Insert the message into the database
        const query = `
            INSERT INTO Message (Sender_ID, Chatroom_ID, Content, Timestamp)
            VALUES (?, ?, ?, ?);
        `;
        
        await db.execute(query, [senderId, chatroomId, content, formattedTimestamp]);

        // Send a success response
        res.status(201).json({ message: "Message sent successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while sending the message." });
    }
};


export const getFullChat = async (req, res) => {
    try {
        // Connect to the database
        const db = await connectDB();

        // Extract chatroom ID from request parameters
        const chatroomId = req.params.id;

        // Query to get all messages in the specified chatroom
        const query = `
            SELECT 
                Message.Message_ID,
                User.username AS Sender_Name,
                Message.Timestamp,
                Message.Content
            FROM Message
            JOIN User ON Message.Sender_ID = User.User_ID
            WHERE Message.Chatroom_ID = ?
            ORDER BY Message.Timestamp ASC;
        `;

        // Execute the query
        const [rows] = await db.promise().execute(query, [chatroomId]);

        // Send the response with the messages
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while retrieving the chat." });
    }
};


export const deleteMessage = async (req, res) => {
    try {
        // Connect to the database
        const db = await connectDB();

        // Extract message ID from request parameters
        const messageId = req.params.id;

        // Query to delete the message by its ID
        const query = `
            DELETE FROM Message
            WHERE Message_ID = ?;
        `;

        // Execute the query
        await db.promise().execute(query, [messageId]);

        // Send a success response
        res.status(200).json({ message: "Message deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while deleting the message." });
    }
};