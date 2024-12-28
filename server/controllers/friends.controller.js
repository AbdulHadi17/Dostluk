
import connectDB from '../database/db.js';



export const findFriends = async (req, res) => {
    try {
      // Get the user ID from cookies (assuming it's set during login)
      const userId = req.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not logged in', success: false });
      }
  
      const db = await connectDB();
  
      // Query to fetch friend recommendations
      const [recommendations] = await db.promise().execute(
        `
        SELECT 
          u.User_ID AS userId, 
          u.username AS name, 
          u.profilePicture AS profilePicture, 
          GROUP_CONCAT(i.Interest_Name) AS commonInterests, 
          ROUND(
              (
                  /* Hybrid Similarity Calculation */
                  (COUNT(ui.Interests_ID) / 
                      (SELECT COUNT(*) FROM User_Interests WHERE User_ID = ?)) * 0.4 /* Jaccard Weight */
                  +
                  (COUNT(ui.Interests_ID) / 
                      SQRT((SELECT COUNT(*) FROM User_Interests WHERE User_ID = ?) * (SELECT COUNT(*) FROM User_Interests WHERE User_ID = u.User_ID))) * 0.3 /* Cosine Weight */
                  +
                  (COUNT(DISTINCT i.Category_ID) / 
                      (SELECT COUNT(DISTINCT i2.Category_ID) 
                       FROM User_Interests ui2 
                       JOIN Interests i2 ON ui2.Interests_ID = i2.Interests_ID 
                       WHERE ui2.User_ID = ?)) * 0.3 /* Category Weight */
              ) * 100, 
              2
          ) AS similarityPercentage
        FROM 
          User u
        JOIN 
          User_Interests ui ON u.User_ID = ui.User_ID
        JOIN 
          Interests i ON ui.Interests_ID = i.Interests_ID
        WHERE 
          u.User_ID != ?
          AND u.User_ID NOT IN (
              SELECT User_ID_2 FROM Friendship WHERE User_ID_1 = ?
              UNION 
              SELECT User_ID_1 FROM Friendship WHERE User_ID_2 = ?
          )
          AND ui.Interests_ID IN (
              SELECT Interests_ID FROM User_Interests WHERE User_ID = ?
          )
        GROUP BY 
          u.User_ID
        ORDER BY 
          similarityPercentage DESC
        LIMIT 5;
        `,
        [userId, userId, userId, userId, userId, userId, userId]
      );
  
      // Transform data for the response
      const response = recommendations.map((user) => ({
        id: user.userId,
        name: user.name,
        profilePicture: user.profilePicture,
        commonInterests: user.commonInterests ? user.commonInterests.split(',') : [],
        similarityPercentage: user.similarityPercentage // Convert to array
      }));
  
      // Send response
      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('Error finding friends:', error);
      return res.status(500).json({ message: 'Server Error', success: false });
    }
  };
  
  
  


  export const sendRequest = async (req, res) => {
    try {
        const db = await connectDB();

        // Extract user IDs
        const userId1 = parseInt(req.id); // From authenticated user (req.id)
        const userId2 = parseInt(req.params.id); // From route parameter (:id)

        if (!userId1 || !userId2 || userId1 === userId2) {
            return res.status(400).json({ message: "Invalid user IDs", success: false });
        }

        // Ensure the smaller ID is user_id_1 and the larger ID is user_id_2
        const [smallerId, largerId] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

        // Check if the request already exists
        const [existingRequest] = await db.promise().execute(
            'SELECT * FROM Friendship WHERE User_ID_1 = ? AND User_ID_2 = ?',
            [smallerId, largerId]
        );

        if (existingRequest.length > 0) {
            // Request exists, delete it
            await db.promise().execute(
                'DELETE FROM Friendship WHERE User_ID_1 = ? AND User_ID_2 = ?',
                [smallerId, largerId]
            );
            return res.status(200).json({
                message: "Friendship request canceled",
                status: "Send Friend Request",
                success: true,
            });
        }

        // Request doesn't exist, insert a new one
        await db.promise().execute(
            'INSERT INTO Friendship (User_ID_1, User_ID_2, Status, Connected_since) VALUES (?, ?, "Requested", CURRENT_DATE)',
            [smallerId, largerId]
        );

        return res.status(201).json({
            message: "Friendship request sent",
            status: "Requested",
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};
export const getFriends = async (req, res) => {
    try {
        const db = await connectDB();
        const userId = req.id;

        // Updated SQL Query
        const query = `
            SELECT 
                cp1.Chatroom_ID AS chatroom_id,
                u.User_ID AS friendId,
                u.username AS name,
                m.Content AS lastMessage,
                c.Name AS chatroomName, -- Fetch chatroom name
                CASE 
                    WHEN m.Sender_ID = ? THEN 'You'
                    ELSE 'Them'
                END AS lastSender
            FROM 
                Chatroom_Participants cp1
            JOIN 
                Chatroom_Participants cp2 
                ON cp1.Chatroom_ID = cp2.Chatroom_ID AND cp1.User_ID != cp2.User_ID
            JOIN 
                User u 
                ON cp2.User_ID = u.User_ID
            JOIN 
                Chatroom c 
                ON cp1.Chatroom_ID = c.Chatroom_ID
            LEFT JOIN 
                Message m 
                ON c.Chatroom_ID = m.Chatroom_ID
            WHERE 
                cp1.User_ID = ?
                AND c.Type_ID = 1
                AND m.Timestamp = (
                    SELECT MAX(Timestamp)
                    FROM Message
                    WHERE Chatroom_ID = c.Chatroom_ID
                )
            ORDER BY 
                m.Timestamp DESC;
        `;

        const result = await db.promise().execute(query, [userId, userId]);
        

        if (!result || !Array.isArray(result)) {
            throw new Error("Invalid database result structure");
        }

        const rows = result[0];
        

        const friendsWithChatrooms = rows.map(row => ({
            friendId: row.friendId,
            name: row.name,
            lastMessage: row.lastMessage,
            lastSender: row.lastSender,
            chatroom_id: row.chatroom_id,
            chatroomName: row.chatroomName // Add chatroom name to the response
        }));

        res.status(200).json({
            friendsList: friendsWithChatrooms,
            success: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const declineFriendRequest = async (req, res) => {
    try {
        const db = await connectDB(); // Establish database connection
        const userId = req.id; // The ID of the logged-in user
        const otherUserId = req.params.id; // The ID of the other user from the request parameters

        // Ensure user_id_1 is the smaller and user_id_2 is the larger
        const [user_id_1, user_id_2] = userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];

        // Query to delete the friendship request where the status is 'Requested'
        const query = `
            DELETE FROM Friendship
            WHERE (User_ID_1 = ? AND User_ID_2 = ?) OR (User_ID_1 = ? AND User_ID_2 = ?)
            AND Status = 'Requested'
        `;

        const [result] = await db.promise().execute(query, [user_id_1, user_id_2, user_id_2, user_id_1]);

        if (result.affectedRows > 0) {
            res.status(200).json({
                success: true,
                message: 'Friend request declined successfully.',
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No friend request found or already declined.',
            });
        }
    } catch (error) {
        console.error('Error declining friend request:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
        });
    }
};


export const acceptFriendRequest = async (req, res) => {
    try {
        const db = await connectDB();

        const user1 = Math.min(req.id, req.params.id); // Smaller ID
        const user2 = Math.max(req.id, req.params.id); // Larger ID

        // Check if a friendship exists with status 'Requested'
        const [friendship] = await db.promise().execute(
            `SELECT * FROM Friendship WHERE User_ID_1 = ? AND User_ID_2 = ? AND Status = 'Requested'`,
            [user1, user2]
        );

        if (!friendship.length) {
            return res.status(400).json({ message: 'No pending friend request found.' });
        }

        // Get usernames from User table
        const [[user1Data], [user2Data]] = await Promise.all([
            db.promise().execute(`SELECT username FROM User WHERE User_ID = ?`, [user1]),
            db.promise().execute(`SELECT username FROM User WHERE User_ID = ?`, [user2])
        ]);

        const username1 = user1Data[0]?.username;
        const username2 = user2Data[0]?.username;

        if (!username1 || !username2) {
            return res.status(400).json({ message: 'Usernames could not be retrieved.' });
        }

        // Update friendship status to 'Connected'
        await db.promise().execute(
            `UPDATE Friendship SET Status = 'Connected', Connected_since = ? WHERE User_ID_1 = ? AND User_ID_2 = ?`,
            [new Date(), user1, user2]
        );

        // Create a new chatroom
        const chatroomName = `Private Chat of ${username1} and ${username2}`;
        const [chatroomResult] = await db.promise().execute(
            `INSERT INTO Chatroom (Type_ID, Name, Description, Created_by, Created_on) VALUES (?, ?, ?, ?, ?)`,
            [1, chatroomName, null, req.params.id, new Date()]
        );

        const chatroomId = chatroomResult.insertId;

        // Add both users to chatroom participants
        const participants = [
            [user1, chatroomId, 2, new Date(), 'Joined'],
            [user2, chatroomId, 2, new Date(), 'Joined']
        ];

        const placeholders = participants.map(() => '(?, ?, ?, ?, ?)').join(', ');
const flattenedValues = participants.flat();

await db.promise().execute(
    `INSERT INTO Chatroom_Participants (User_ID, Chatroom_ID, Role_ID, Joined_on, Status) VALUES ${placeholders}`,
    flattenedValues
);

        res.status(200).json({
            message: 'Friend request accepted.',
            chatroomId: chatroomId,
            success:true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};


export const getFriendRequests = async (req, res) => {
    try {
        const db = await connectDB(); // Establish database connection
        const userId = req.id; // The ID of the logged-in user, obtained from the request

        // Query to fetch friend requests with requester details
        const query = `
            SELECT 
                CASE 
                    WHEN Friendship.User_ID_1 = ? THEN Friendship.User_ID_2
                    ELSE Friendship.User_ID_1
                END AS requester_id,
                User.username AS name,
                User.profilePicture AS profilePicture
            FROM Friendship
            JOIN User 
                ON (User.User_ID = Friendship.User_ID_1 AND Friendship.User_ID_2 = ?)
                OR (User.User_ID = Friendship.User_ID_2 AND Friendship.User_ID_1 = ?)
            WHERE Friendship.Status = 'Requested'
        `;

        const [rows] = await db.promise().execute(query, [userId, userId, userId]);

        if (rows.length > 0) {
            res.status(200).json({
                success: true,
                data: rows.map((row) => ({
                    id: row.requester_id,
                    name: row.name,
                    profilePicture: row.profilePicture,
                })),
            });
        } else {
            res.status(200).json({
                success: true,
                data:[],
                message: 'No incoming friend requests.',
            });
        }
    } catch (error) {
        console.error('Error fetching friend requests:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
        });
    }
};
