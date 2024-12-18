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

