// -------------------- Import Required Modules --------------------
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    setupDatabase,
    getCourses,
    getInstructors,
    getEvents,
    getFaqs,
    saveContactMessage,
    getReviews,
    addReview
} from './database.js';

// -------------------- Setup Express App --------------------
const app = express();
const PORT = Number(process.env.PORT || 3000);

// -------------------- Configure __dirname --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------- Middleware --------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// -------------------- View Engine Setup --------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// -------------------- Initialize Database --------------------
setupDatabase();

// -------------------- Routes: Home Page --------------------
app.get('/', async (req, res) => {
    try {
        const featuredCourses = await getCourses(3);
        const featuredInstructors = await getInstructors(3);
        const upcomingEvents = await getEvents(3);

        res.render('pages/index', {
            title: 'Home',
            activePage: 'home',
            featuredCourses,
            featuredInstructors,
            upcomingEvents
        });
    } catch (err) {
        console.error('Error rendering home page:', err);
        res.status(500).send('Server error');
    }
});

// -------------------- Routes: Courses Page --------------------
app.get('/courses', async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        const allCourses = await getCourses();

        const filteredCourses = allCourses.filter(course =>
            course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        res.render('pages/courses', {
            title: 'Courses',
            activePage: 'courses',
            courses: filteredCourses,
            searchQuery
        });
    } catch (err) {
        console.error('Error rendering courses page:', err);
        res.status(500).send('Server error');
    }
});

// -------------------- Routes: Instructors Page --------------------
app.get('/instructors', async (req, res) => {
    try {
        const instructors = await getInstructors();
        res.render('pages/instructors', {
            title: 'Instructors',
            activePage: 'instructors',
            instructors
        });
    } catch (err) {
        console.error('Error rendering instructors page:', err);
        res.status(500).send('Server error');
    }
});

// -------------------- Routes: Schedule Page --------------------
app.get('/schedule', async (req, res) => {
    try {
        const events = await getEvents();
        const enhancedEvents = events.map(event => {
            const title = event.title.toLowerCase();
            let type = 'other';

            if (
                title.includes('q&a') ||
                title.includes('qa') ||
                title.includes('q & a') ||
                title.includes('q and a')
            ) {
                type = 'q&a';
            } else if (title.includes('workshop')) {
                type = 'workshop';
            } else if (title.includes('masterclass')) {
                type = 'masterclass';
            }

            return { ...event, type };
        });

        res.render('pages/schedule', {
            title: 'Schedule',
            events: enhancedEvents
        });
    } catch (err) {
        console.error('Error rendering schedule page:', err);
        res.status(500).send('Server error');
    }
});

// -------------------- API: Calendar Events --------------------
app.get('/api/events', async (req, res) => {
    try {
        const events = await getEvents();
        const calendarEvents = events.map(event => ({
            title: event.title,
            start: event.date,
            time: event.time,
            instructor: event.instructor_name
        }));
        res.json(calendarEvents);
    } catch (err) {
        console.error('Error loading calendar events:', err);
        res.status(500).json({ error: 'Failed to load events' });
    }
});

// -------------------- Routes: FAQ Page --------------------
app.get('/faq', async (req, res) => {
    try {
        const faqs = await getFaqs();
        res.render('pages/faq', {
            title: 'FAQ',
            activePage: 'faq',
            faqs
        });
    } catch (err) {
        console.error('Error rendering FAQ page:', err);
        res.status(500).send('Server error');
    }
});

// -------------------- Routes: Contact Page --------------------
app.get('/contact', (req, res) => {
    res.render('pages/contact', {
        title: 'Contact Us',
        activePage: 'contact',
        message: null
    });
});

// -------------------- POST: Contact Form Submission --------------------
app.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.render('pages/contact', {
                title: 'Contact Us',
                activePage: 'contact',
                error: 'Please fill out all required fields',
                formData: req.body
            });
        }

        await saveContactMessage(name, email, subject, message);

        res.render('pages/contact', {
            title: 'Contact Us',
            activePage: 'contact',
            success: 'Your message has been sent successfully!',
            formData: {}
        });
    } catch (err) {
        console.error('Error handling contact form submission:', err);
        res.status(500).send('Server error');
    }
});

// -------------------- Routes: Reviews Page --------------------
app.get('/reviews', async (req, res) => {
    try {
        const allReviews = await getReviews();
        const totalReviews = allReviews.length;

        const averageRating = totalReviews > 0
            ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
            : 0;

        const latestReviews = allReviews.slice(-5).reverse();

        res.render('pages/reviews', {
            title: 'Reviews',
            activePage: 'reviews',
            reviews: latestReviews,
            averageRating,
            totalReviews
        });
    } catch (err) {
        console.error('Error rendering reviews page:', err);
        res.status(500).send('Server error');
    }
});

// -------------------- POST: Review Submission --------------------
app.post('/reviews', async (req, res) => {
    try {
        const { name, rating, comment, website } = req.body;

        if (website) return res.status(400).send('Spam detected.');

        if (!name || !rating || !comment) {
            const reviews = await getReviews(5);
            let averageRating = 0;

            if (reviews.length > 0) {
                const total = reviews.reduce((sum, r) => sum + r.rating, 0);
                averageRating = parseFloat((total / reviews.length).toFixed(1));
            }

            return res.render('pages/reviews', {
                title: 'Reviews',
                activePage: 'reviews',
                error: 'Please fill out all required fields',
                formData: req.body,
                reviews,
                averageRating
            });
        }

        await addReview(name, rating, comment);
        res.redirect('/reviews');
    } catch (err) {
        console.error('Error handling review form submission:', err);
        res.status(500).send('Server error');
    }
});

// -------------------- Start Server --------------------
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
