
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
  const userId = req.id; // Extracting user ID from the request

  const db = await connectDB();
  try {
      // Query to get friends and their last message
      const [friends] = await db.promise().execute(
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

      // Formatting the response
      const friendsList = friends.map((friend) => ({
          id: friend.friendId,
          name: friend.name,
          lastMessage: friend.lastMessage || "No messages yet",
          lastSender: friend.lastSender || "-",
      }));

      return res.status(200).json({friendsList , success:true});
  } catch (error) {
      console.error("Error fetching friends list:", error);
      return res.status(500).json({ error: "Internal Server Error" , success:false });
  }
};
  