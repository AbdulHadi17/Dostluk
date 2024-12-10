import mysql from 'mysql2';

const connectDB = () => {
    return new Promise((resolve, reject) => {
        const db = mysql.createConnection({
            host: process.env.VITE_DB_HOST, // Environment variable for host
            user: process.env.VITE_DB_USER, // Environment variable for user
            password: process.env.VITE_DB_PASSWORD, // Environment variable for password
            database: process.env.VITE_DB_DATABASE_NAME, // Environment variable for database name
        });

        db.connect((err) => {
            if (err) {
                console.error('Database connection failed:', err.stack);
                reject(err); // Reject the promise on error
            } else {
                console.log('Connected to the database.');
                resolve(db); // Resolve the promise with the connection object
            }
        });
    });
};

export default connectDB;
