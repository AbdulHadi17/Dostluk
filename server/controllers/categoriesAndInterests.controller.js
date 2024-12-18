import connectDB from "../database/db.js";

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


export const getAllInterests = async (req, res) => {
    try {
        const db = await connectDB();

        const [rows] = await db.promise().execute(
            'SELECT Interest_name FROM interests'
        );

        // Map the rows to extract the interest names into an array
        const interests = rows.map(row => row.Interest_name);

        return res.status(200).json({ interests, success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};
