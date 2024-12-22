
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

      // First query: Fetch friends list
      const [friendsList] = await db.promise().execute(
          `SELECT 
          CASE
              WHEN f.User_ID_1 = ? THEN f.User_ID_2
              ELSE f.User_ID_1
          END AS friendId,
          u.Username AS name,
          COALESCE(m.Content, 'No messages yet') AS lastMessage,
          CASE 
              WHEN m.Content IS NULL THEN '-' 
              WHEN m.Sender_ID = ? THEN 'You' 
              ELSE u.Username 
          END AS lastSender
          FROM Friendship f
          JOIN User u ON u.User_ID = (CASE WHEN f.User_ID_1 = ? THEN f.User_ID_2 ELSE f.User_ID_1 END)
          LEFT JOIN Message m ON (m.Sender_ID = u.User_ID OR m.Sender_ID = ?) 
              AND m.Timestamp = (
                  SELECT MAX(Timestamp)
                  FROM Message
                  WHERE (Sender_ID = u.User_ID OR Sender_ID = ?)
              )
          WHERE (f.User_ID_1 = ? OR f.User_ID_2 = ?) AND f.Status = 'Connected';`,
          [userId, userId, userId, userId, userId, userId, userId]
      );

      // Second query: Fetch chatroom IDs for each friend
      const friendsWithChatrooms = await Promise.all(
          friendsList.map(async (friend) => {
              const [chatroom] = await db.promise().execute(
                  `SELECT c.Chatroom_ID 
                  FROM Chatroom c
                  JOIN Chatroom_Participants cp1 ON c.Chatroom_ID = cp1.Chatroom_ID
                  JOIN Chatroom_Participants cp2 ON c.Chatroom_ID = cp2.Chatroom_ID
                  WHERE c.Type_ID = 1
                    AND cp1.User_ID = ?
                    AND cp2.User_ID = ?;`,
                  [userId, friend.friendId]
              );
              return {
                  ...friend,
                  chatroom_id: chatroom.length > 0 ? chatroom[0].Chatroom_ID : null
              };
          })
      );

      res.status(200).json({
          friendsList: friendsWithChatrooms,
          success: true
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error });
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
            chatroomId: chatroomId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};
