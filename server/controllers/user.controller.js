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
        const { username, selectedInterests } = req.body;
        const userId = req.id; // Assuming middleware has set userId from cookies
        const profilePictureFile = req.file; // Multer provides the uploaded file in `req.file`

        if (!userId) {
            return res.status(401).json({ message: "User not logged in", success: false });
        }

        const db = await connectDB();

        // Fetch existing values for the user
        const [user] = await db.promise().execute(
            'SELECT username, profilePicture FROM user WHERE User_ID = ?',
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const currentUsername = user[0].username;
        const currentProfilePicture = user[0].profilePicture;

        let profilePictureUrl = currentProfilePicture;

        // Upload new profile picture to Cloudinary if provided
        if (profilePictureFile) {
            const fileUri = getDataUri(profilePictureFile);
            const uploadResult = await cloudinary.uploader.upload(fileUri, {
                folder: 'profile_pictures', // Optional: specify folder in Cloudinary
                public_id: `user_${userId}` // Optional: specify a unique public ID
            });
            profilePictureUrl = uploadResult.secure_url; // Get the uploaded file's URL
        }

        // Update username and profile picture only if provided, else retain existing values
        await db.promise().execute(
            'UPDATE user SET username = ?, profilePicture = ? WHERE User_ID = ?',
            [
                username || currentUsername, // Use provided value or retain the existing one
                profilePictureUrl, // Updated or retained profile picture URL
                userId
            ]
        );

        // Handle interests only if provided
        if (Array.isArray(selectedInterests) && selectedInterests.length > 0) {
            // Delete existing interests of the user
            await db.promise().execute('DELETE FROM user_interests WHERE User_ID = ?', [userId]);

            // Insert new interests
            const interestIds = await Promise.all(
                selectedInterests.map(async (interest) => {
                    const [result] = await db
                        .promise()
                        .execute('SELECT Interests_ID FROM interests WHERE Interest_name = ?', [interest]);
                    return result.length > 0 ? result[0].Interests_ID : null;
                })
            );

            const validInterestIds = interestIds.filter((id) => id !== null);

            await Promise.all(
                validInterestIds.map((interestId) =>
                    db.promise().execute('INSERT INTO user_interests (User_ID, Interests_ID) VALUES (?, ?)', [
                        userId,
                        interestId,
                    ])
                )
            );
        }

        return res.status(200).json({ message: "Profile updated successfully", success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error", success: false });
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
