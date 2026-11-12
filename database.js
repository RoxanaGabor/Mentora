import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Connect to SQLite database
const dbPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'mentora.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Initialize all tables
export function setupDatabase() {
    // Enable foreign key constraints
    db.run('PRAGMA foreign_keys = ON');

    db.serialize(() => {
        // Instructors table
        db.run(`CREATE TABLE IF NOT EXISTS instructors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            bio TEXT NOT NULL,
            subjects TEXT NOT NULL,
            email TEXT NOT NULL,
            image TEXT
        )`);

        // Courses table (linked to instructors)
        db.run(`CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            duration TEXT NOT NULL,
            instructor_id INTEGER,
            image TEXT,
            FOREIGN KEY (instructor_id) REFERENCES instructors(id)
        )`);

        // Events table (linked to instructors)
        db.run(`CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            instructor_id INTEGER,
            FOREIGN KEY (instructor_id) REFERENCES instructors(id)
        )`);

        // FAQs table
        db.run(`CREATE TABLE IF NOT EXISTS faqs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL
        )`);

        // Contact messages table
        db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Reviews table
        db.run(`CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT NOT NULL,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

// ----- Query Functions -----

// Get all or a limited number of courses with instructor names
export function getCourses(limit = null) {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT c.*, i.name as instructor_name 
            FROM courses c
            JOIN instructors i ON c.instructor_id = i.id
            ORDER BY c.id
        `;
        if (limit) query += ` LIMIT ${limit}`;

        db.all(query, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Get all or a limited number of instructors
export function getInstructors(limit = null) {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM instructors ORDER BY id';
        if (limit) query += ` LIMIT ${limit}`;

        db.all(query, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Get all or a limited number of events with instructor names
export function getEvents(limit = null) {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT e.*, i.name as instructor_name 
            FROM events e
            JOIN instructors i ON e.instructor_id = i.id
            ORDER BY e.date, e.time
        `;
        if (limit) query += ` LIMIT ${limit}`;

        db.all(query, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Get all FAQs
export function getFaqs() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM faqs ORDER BY id', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Save a contact message
export function saveContactMessage(name, email, subject, message) {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

// Get recent reviews (default limit = 5)
export function getReviews(limit = 5) {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM reviews ORDER BY submitted_at DESC LIMIT ?',
            [limit],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
}

// Add a new review
export function addReview(name, rating, comment) {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO reviews (name, rating, comment) VALUES (?, ?, ?)',
            [name, rating, comment],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}
