import connectDB from "../database/db.js";

export const getDepartments = async (req, res) => {
    try {
        const db = await connectDB(); // Connect to the database
        const [departments] = await db.promise().execute('SELECT * FROM Department');

        // Send the departments as a response
        res.status(200).json({ departments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};
