import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectDB from '../database/db.js'; // Import the connectDB function
import cloudinary from '../utils/cloudinary.js';
import getDataUri from '../utils/datauri.js';

// Register function
export const Register = async (req, res) => {
    try {
        const { email, password, dept_id, username } = req.body;

        // Check if the email ends with @student.nust.edu.pk
        const emailRegex = /^[a-zA-Z0-9._%+-]+@student\.nust\.edu\.pk$/;
        if (!emailRegex.test(email)) {
            return res.status(401).json({ message: "Only nust outlook mail is accepted", success: false });
        }

        if (!email || !password || !dept_id || !username) {
            return res.status(401).json({ message: "Please Fill in the empty Fields", success: false });
        }

        const db = await connectDB(); // Connect to the database

        const [user] = await db.promise().execute('SELECT * FROM user WHERE email = ?', [email]);

        if (user.length > 0) {
            return res.status(401).json({ message: "Email Already in Use", success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const joined_on = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

        await db.promise().execute('INSERT INTO user (email, password, dept_id, username, joined_on) VALUES (?, ?, ?, ?, ?)', [email, hashedPassword, dept_id, username, joined_on]);

        return res.status(201).json({ message: "Account created successfully", success: true });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};
// Login function
export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).json({ message: "Please Fill in the empty Fields", success: false });
        }

        const db = await connectDB(); // Connect to the database

        const [user] = await db.promise().execute('SELECT * FROM user WHERE email = ?', [email]);

        if (user.length === 0) {
            return res.status(401).json({ message: "User doesn't exist", success: false });
        }

        const isValidPassword = await bcrypt.compare(password, user[0].Password);

        if (!isValidPassword) {
            return res.status(401).json({ message: "Email or password is invalid", success: false });
        }

        const token = jwt.sign({ userId: user[0].User_ID }, process.env.VITE_SECRET_KEY, { expiresIn: '1d' });

        return res.cookie("token", token, { httpOnly: true, sameSite: "strict", maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome Back ${user[0].username}`,
            success: true,
            user: {
                id: user[0].User_ID,
                email: user[0].Email,
                dept_id: user[0].Dept_ID,
                username: user[0].username,
                joined_on: user[0].Joined_on
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

// Logout function
export const Logout = async (req, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out Successfully",
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

// Edit profile function
export const editProfile = async (req, res) => {
    try {
      const { username, selectedInterests } = req.body; // selectedInterests is already an array
      const userId = req.id; // Assuming middleware sets userId
      const profilePictureFile = req.file;
  
      console.log('User ID:', userId);
      console.log('Request Body:', req.body);
      console.log('Uploaded File:', req.file);
      console.log('Selected Interests:', selectedInterests);
  
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
  
      const db = await connectDB();
  
      // Fetch current profilePicture if no file uploaded
      const [user] = await db.promise().execute('SELECT profilePicture FROM user WHERE User_ID = ?', [userId]);
      let profilePictureUrl = user[0]?.profilePicture || null;
  
      if (profilePictureFile) {
        const fileUri = getDataUri(profilePictureFile);
        console.log('File URI:', fileUri);
  
        const uploadResult = await cloudinary.uploader.upload(fileUri);
        profilePictureUrl = uploadResult.secure_url;
        console.log('Uploaded Profile Picture URL:', profilePictureUrl);
      }
  
      // Update username and profilePicture
      await db.promise().execute(
        'UPDATE user SET username = ?, profilePicture = ? WHERE User_ID = ?',
        [username || user[0]?.username, profilePictureUrl, userId]
      );
      console.log('User updated successfully');
  
      // Handle selected interests
      if (selectedInterests && Array.isArray(selectedInterests)) {
        await db.promise().execute('DELETE FROM user_interests WHERE User_ID = ?', [userId]);
  
        const interestIds = await Promise.all(
          selectedInterests.map(async (interest) => {
            const [result] = await db
              .promise()
              .execute('SELECT Interests_ID FROM interests WHERE Interest_name = ?', [interest]);
            console.log(`Interest Result for "${interest}":`, result);
            return result[0]?.Interests_ID || null;
          })
        );
  
        const validInterestIds = interestIds.filter((id) => id !== null);
  
        console.log('Valid Interest IDs:', validInterestIds);
  
        await Promise.all(
          validInterestIds.map((interestId) =>
            db.promise().execute('INSERT INTO user_interests (User_ID, Interests_ID) VALUES (?, ?)', [userId, interestId])
          )
        );
        console.log('Interests updated successfully');
      }
  
      res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error in editProfile:', error);
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  };
  
  

// Fetch categories and interests function
export const getCategoriesAndInterests = async (req, res) => {
    try {
        const db = await connectDB();

        const [categories] = await db.promise().execute(
            'SELECT c.Category_name, i.Interest_name FROM category c JOIN interests i ON c.Category_ID = i.Category_ID'
        );

        const categoryMap = categories.reduce((acc, row) => {
            if (!acc[row.Category_name]) {
                acc[row.Category_name] = [];
            }
            acc[row.Category_name].push(row.Interest_name);
            return acc;
        }, {});

        return res.status(200).json({ categories: categoryMap, success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};


export const getUserData = async (req, res) => {
  try {
    // Get the user ID from cookies (assuming it's set during login)
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not logged in', success: false });
    }

    const db = await connectDB();

    // Query to fetch username, profilePicture, and interests using joins
    const [userInfo] = await db.promise().execute(
      `
      SELECT 
        u.username, 
        u.profilePicture, 
        GROUP_CONCAT(i.Interest_name) AS interests
      FROM 
        user u
      LEFT JOIN 
        user_interests ui ON u.User_ID = ui.User_ID
      LEFT JOIN 
        interests i ON ui.Interests_ID = i.Interests_ID
      WHERE 
        u.User_ID = ?
      GROUP BY 
        u.User_ID;
      `,
      [userId]
    );

    if (userInfo.length === 0) {
      return res.status(404).json({ message: 'User not found', success: false });
    }

    // Extract data from query result
    const { username, profilePicture, interests } = userInfo[0];

    // Send response
    return res.status(200).json({
      username,
      profilePicture,
      interests: interests ? interests.split(',') : [], // Convert interests string to an array
      success: true,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ message: 'Server Error', success: false });
  }
};

