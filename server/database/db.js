import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from a .env file
// Create a single connection pool (initialized once)
const pool = mysql.createPool({
    host: process.env.VITE_DB_HOST,            // Environment variable for host
    user: process.env.VITE_DB_USER,            // Environment variable for user
    password: process.env.VITE_DB_PASSWORD,    // Environment variable for password
    database: process.env.VITE_DB_DATABASE_NAME, // Environment variable for database name
    waitForConnections: true,                  // Wait for a free connection
    connectionLimit: 10,                       // Maximum connections in the pool
    queueLimit: 0                              // No limit on queued requests
});

const connectDB = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Database connection failed:', err.stack);
                reject(err); // Reject the promise on error
            } else {
                console.log('Connected to the database (via pool).');
                resolve(connection); // Return the connection object
                connection.release(); // Release the connection back to the pool
            }
        });
    });
};

export default connectDB;
