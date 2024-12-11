import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectDB from '../database/db.js'; // Import the connectDB function

// Register function
export const Register = async (req, res) => {
    try {
        const { email, password, dept_id, full_name } = req.body;

        // Check if the email ends with @student.nust.edu.pk
        const emailRegex = /^[a-zA-Z0-9._%+-]+@student\.nust\.edu\.pk$/;
        if (!emailRegex.test(email)) {
            return res.status(401).json({ message: "Only nust outlook mail is accepted", success: false });
        }

        if (!email || !password || !dept_id || !full_name) {
            return res.status(401).json({ message: "Please Fill in the empty Fields", success: false });
        }

        const db = await connectDB(); // Connect to the database

        const [user] = await db.promise().execute('SELECT * FROM user WHERE email = ?', [email]);

        if (user.length > 0) {
            return res.status(401).json({ message: "Email Already in Use", success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const joined_on = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

        await db.promise().execute('INSERT INTO user (email, password, dept_id, full_name, joined_on) VALUES (?, ?, ?, ?, ?)', [email, hashedPassword, dept_id, full_name, joined_on]);

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
            message: `Welcome Back ${user[0].Full_name}`,
            success: true,
            user: {
                id: user[0].User_ID,
                email: user[0].Email,
                dept_id: user[0].Dept_ID,
                full_name: user[0].Full_name,
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
