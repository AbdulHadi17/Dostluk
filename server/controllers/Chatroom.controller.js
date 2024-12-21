import connectDB from '../database/db.js';

export const getChatrooms = async (req, res) => {
  try {
    const db = await connectDB();

    const [chatrooms] = await db.promise().execute(
      `SELECT * FROM Chatroom`
    );

    return res.status(200).json({ chatrooms, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
};

export const createChatroom = async (req, res) => {
  try {
      const { name, description, type_id, interests } = req.body;
      const created_by = req.id; // Assuming the middleware sets req.id
      const created_on = new Date();

      console.log(req.body);
      console.log(req.id);

      // Validate input
      if (!name || !type_id || !interests || interests.length > 2 || interests.length <= 0) {
          return res.status(400).json({ message: 'Invalid input data', success: false });
      }

      const db = await connectDB();

      // Validate and map interests to their IDs
      const placeholders = interests.map(() => '?').join(', ');
      const [existingInterests] = await db.promise().execute(
          `SELECT Interests_ID, Interest_name FROM Interests WHERE Interest_name IN (${placeholders})`,
          interests
      );

      if (existingInterests.length !== interests.length) {
          return res.status(400).json({ message: 'Invalid interests provided', success: false });
      }

      // Map interests names to their IDs
      const interestIds = existingInterests.map((interest) => interest.Interests_ID);

      // Validate type_id exists in the Chatroom_Type table
      const [chatroomType] = await db.promise().execute(
          `SELECT Type_ID FROM Chatroom_Type WHERE Type_ID = ?`,
          [type_id]
      );

      if (chatroomType.length === 0) {
          return res.status(400).json({ message: 'Invalid chatroom type provided', success: false });
      }

      // Start a transaction
      await db.promise().beginTransaction();

      // Insert chatroom into Chatroom table
      const [chatroomResult] = await db.promise().execute(
          `INSERT INTO Chatroom (Type_ID, Name, Description, Created_by, Created_on)
           VALUES (?, ?, ?, ?, ?)`,
          [type_id, name, description, created_by, created_on]
      );

      const chatroom_id = chatroomResult.insertId;

      // Insert interests into Chatroom_Interests table
      const interestPromises = interestIds.map((interest_id) => {
          return db.promise().execute(
              `INSERT INTO Chatroom_Interests (Chatroom_ID, Interests_ID)
               VALUES (?, ?)`,
              [chatroom_id, interest_id]
          );
      });

      await Promise.all(interestPromises);

      // Add creator to Chatroom_Participants table as admin
      await db.promise().execute(
          `INSERT INTO Chatroom_Participants (User_ID, Chatroom_ID, Role_ID, Joined_on, Status)
           VALUES (?, ?, ?, ?, ?)`,
          [created_by, chatroom_id, 1, created_on, 'Joined']
      );

      // Commit the transaction
      await db.promise().commit();

      return res.status(201).json({
          message: 'Chatroom created successfully',
          chatroom_id,
          success: true
      });
  } catch (error) {
      console.error(error);

      // Rollback the transaction in case of an error
      if (db) {
          await db.promise().rollback();
      }

      return res.status(500).json({
          message: 'Internal server error',
          success: false
      });
  }
};

export const joinChatroom = async (req, res) => {
    try {
        const user_id = req.id; // Assuming the middleware sets req.id
        const chatroom_id = req.params.id; // Chatroom ID from route parameter
        const role_id = 2; // Role ID for member
        const joined_on = new Date();
        const status = 'Joined';

        if (!user_id) {
          return res.status(401).json({ message: 'User not logged in', success: false });
        }

        if (!chatroom_id || isNaN(chatroom_id)) {
            return res.status(400).json({ message: 'Invalid chatroom ID', success: false });
        }

        const db = await connectDB();

        // Check if user is already part of the chatroom
        const [existingParticipant] = await db.promise().execute(
            `SELECT * FROM Chatroom_Participants WHERE User_ID = ? AND Chatroom_ID = ?`,
            [user_id, chatroom_id]
        );

        if (existingParticipant.length > 0) {
            return res.status(400).json({ message: 'User already joined the chatroom', success: false });
        }

        // Insert user into Chatroom_Participants table
        await db.promise().execute(
            `INSERT INTO Chatroom_Participants (User_ID, Chatroom_ID, Role_ID, Joined_on, Status)
             VALUES (?, ?, ?, ?, ?)`,
            [user_id, chatroom_id, role_id, joined_on, status]
        );

        return res.status(201).json({
            message: 'Successfully joined the chatroom',
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export const suggestedChatrooms = async (req, res) => {
    const userId = req.id; // Get user_id from the request

    try {
        const db = await connectDB();

        // Step 1: Get the user's interests and their categories
        const [userInterests] = await db.promise().execute(
            `SELECT DISTINCT i.Category_ID 
             FROM User_Interests ui
             JOIN Interests i ON ui.Interests_ID = i.Interests_ID
             WHERE ui.User_ID = ?`,
            [userId]
        );

        const userCategories = userInterests.map(row => row.Category_ID);
        console.log('hadi ' + userCategories)
        if (userCategories.length === 0) {
            return res.status(200).json({ chatrooms: [] , message:'User has no interests' });
        }


        const placeholders = userCategories.map(() => '?').join(', ');
        console.log(placeholders);
        // Step 2: Get chatrooms matching the same category and type_id = 3
        const [chatrooms] = await db.promise().execute(
            `SELECT c.Chatroom_ID, c.Name, c.Description, 
                    MAX(p.username) AS friendName, MAX(p.profilePicture) AS friendProfile,
                    GROUP_CONCAT(DISTINCT i.Interest_Name) AS interests
             FROM Chatroom c
             JOIN Chatroom_Interests ci ON c.Chatroom_ID = ci.Chatroom_ID
             JOIN Interests i ON ci.Interests_ID = i.Interests_ID
             LEFT JOIN Chatroom_Participants cp ON c.Chatroom_ID = cp.Chatroom_ID
             LEFT JOIN Friendship f ON (f.User_ID_1 = ? AND f.User_ID_2 = cp.User_ID)
             LEFT JOIN User p ON p.User_ID = cp.User_ID
             WHERE i.Category_ID IN (${placeholders})
               AND c.Type_ID = 3
               AND c.Chatroom_ID NOT IN (
                   SELECT Chatroom_ID 
                   FROM Chatroom_Participants
                   WHERE User_ID = ?
               )
             GROUP BY c.Chatroom_ID, c.Name, c.Description`,
            [userId, ...userCategories, userId]
        );
console.log(chatrooms)
console.log(1)
        // Step 3: Format the response
        const formattedChatrooms = Object.values(chatrooms).map(chatroom => ({
            chatroomId: chatroom.Chatroom_ID,
            name: chatroom.Name,
            description: chatroom.Description,
            friendName: chatroom.friendName,
            friendProfile: chatroom.friendProfile,
            interests: chatroom.interests ? chatroom.interests.split(",") : []
        }));

        console.log('Hadi '+ formattedChatrooms);
        
        res.status(200).json({ chatrooms: formattedChatrooms  , success:true});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" , success:false});
    }
};



export const getUserChatrooms = async (req, res) => {
    const userId = req.id; // Extracting user ID from the request
    const db = await connectDB();
    try {
        // Query to get chatrooms where the user is a participant
        const [chatrooms] = await db.promise().execute(
                    `SELECT 
            c.Chatroom_ID AS id, 
            c.Name AS name, 
            COALESCE(m.Content, 'No messages yet') AS lastMessage, 
            COALESCE(u.Username, '-') AS lastSender
        FROM Chatroom_Participants cp
        JOIN Chatroom c ON cp.Chatroom_ID = c.Chatroom_ID
        LEFT JOIN Message m ON c.Chatroom_ID = m.Chatroom_ID 
            AND m.Timestamp = (
                SELECT MAX(Timestamp) 
                FROM Message 
                WHERE Chatroom_ID = c.Chatroom_ID
            )
        LEFT JOIN User u ON m.Sender_ID = u.User_ID
        WHERE cp.User_ID = ?;
`,
            [userId]
        );

        // Formatting the response
        const chatRooms = chatrooms.map((chatroom) => ({
            id: chatroom.id,
            name: chatroom.name,
            lastMessage: chatroom.lastMessage || "No messages yet",
            lastSender: chatroom.lastSender || "-",
        }));

        return res.status(200).json({chatrooms:chatRooms , success:true});
    } catch (error) {
        console.error("Error fetching user chatrooms:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteChatroom = async (req, res) => {
    const chatroomId = req.params.id; // Extract chatroom ID from the request parameters
    const db = await connectDB();
    try {
        // Query to delete the chatroom
        const [result] = await db.promise().execute(
            `DELETE FROM Chatroom WHERE Chatroom_ID = ?`,
            [chatroomId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Chatroom not found", success: false });
        }

        return res.status(200).json({ message: "Chatroom deleted successfully", success: true });
    } catch (error) {
        console.error("Error deleting chatroom:", error);
        return res.status(500).json({ error: "Internal Server Error", success: false });
    }
};