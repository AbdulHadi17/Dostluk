import connectDB from '../database/db.js';
import cloudinary from '../utils/cloudinary.js';
import getDataUri from '../utils/datauri.js';

export const getLostAndFoundItems = async (req, res) => {
    try {
        const db = await connectDB();

        // Query to fetch lost and found items along with reporter's profile picture
        const [items] = await db.promise().execute(
            `
            SELECT 
                i.Item_ID AS itemId,
                i.Item_name AS itemName,
                i.Description AS description,
                i.Item_Picture AS itemPicture,
                s.Status_name AS itemStatus,
                u.username AS reportedBy,
                u.profilePicture AS reporterProfilePicture,
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
            title: item.itemName,
            description: item.description,
            image: item.itemPicture,
            type: item.itemStatus,
            reportedBy: item.reportedBy,
            profilePicture: item.reporterProfilePicture || null, // Default profile picture
            date: item.reportedDate,
        }));

        return res.status(200).json({ data: response, success: true });
    } catch (error) {
        console.error("Error fetching Lost and Found items:", error);
        return res.status(500).json({ message: "An error occurred", success: false });
    }
};

export const addAnItem = async (req, res) => {
  try {
    const db = await connectDB();
    const { title, description, reportDate, status } = req.body;
    const reportedByUserId = req.id; // Extracted from middleware
    const itemPictureFile = req.file; // File uploaded from form-data

    // Check if the user is authenticated
    if (!reportedByUserId) {
      return res.status(401).json({
        message: "Unauthorized User",
        success: false,
      });
    }

    // Validate required fields
    if (!title || !status || !reportDate) {
      return res.status(400).json({
        message: "Missing required fields (title, status, or reportDate)",
        success: false,
      });
    }

    // Fetch the Status_ID based on the status name
    const [statusResult] = await db.promise().execute(
      `SELECT Status_ID FROM Item_Status WHERE Status_name = ?`,
      [status]
    );

    if (statusResult.length === 0) {
      return res.status(400).json({
        message: `Invalid status: ${status}. Must be 'Lost' or 'Found'.`,
        success: false,
      });
    }

    const statusId = statusResult[0].Status_ID;

    // Upload the item picture to Cloudinary, if provided
    let itemPictureUrl = null;
    if (itemPictureFile) {
      const fileUri = getDataUri(itemPictureFile); // Convert file to data URI
      const uploadResult = await cloudinary.uploader.upload(fileUri, {
        folder: "lost_and_found_items", // Optional: organize images in a folder
      });
      itemPictureUrl = uploadResult.secure_url; // Cloudinary URL for the uploaded image
    }

    // Insert the new item into the Lost_And_Found_Item table
    await db.promise().execute(
      `
      INSERT INTO Lost_And_Found_Item 
      (Item_name, Description, Item_Picture, Status_ID, Reported_By_User, Reported_Date)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description || null,
        itemPictureUrl || null,
        statusId,
        reportedByUserId,
        reportDate,
      ]
    );

    // Respond with a success message
    return res.status(201).json({
      message: `${status} item added successfully`,
      success: true,
    });
  } catch (error) {
    console.error("Error adding an item:", error);
    return res.status(500).json({
      message: "An error occurred while adding the item",
      success: false,
    });
  }
};
