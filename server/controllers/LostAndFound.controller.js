import connectDB from '../database/db.js';

export const getLostAndFoundItems = async (req, res) => {
    try {
        const db = await connectDB();

        // Query to fetch lost and found items
        const [items] = await db.promise().execute(
            `
            SELECT 
                i.Item_ID AS itemId,
                i.Item_name AS itemName,
                i.Description AS description,
                i.Item_Picture AS itemPicture,
                s.Status_name AS itemStatus,
                u.username AS reportedBy,
                i.Reported_Date AS reportedDate
            FROM 
                Lost_And_Found_Item i
            JOIN 
                Item_Status s ON i.Status_ID = s.Status_ID
            JOIN 
                User u ON i.Reported_By_User = u.User_ID
            ORDER BY 
                i.Reported_Date DESC;
            `
        );

        // Transform data for the response
        const response = items.map((item) => ({
            id: item.itemId,
            name: item.itemName,
            description: item.description,
            picture: item.itemPicture,
            status: item.itemStatus,
            reportedBy: item.reportedBy,
            reportedDate: item.reportedDate
        }));

        return res.status(200).json({ data: response, success: true });
    } catch (error) {
        console.error("Error fetching Lost and Found items:", error);
        return res.status(500).json({ message: "An error occurred", success: false });
    }
};

