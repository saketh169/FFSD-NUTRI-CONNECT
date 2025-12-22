# NutriConnect

**A web-based platform connecting individuals with dietitians and nutritionists for personalized dietary guidance and wellness.**

---

## Deployment

The MVC application is deployed on the following platforms:

- **Vercel**: https://your-app-name.vercel.app

- **Render**: https://ffsd-nutri-connect.onrender.com
---

## Overview

NutriConnect empowers users to achieve their fitness and wellness goals through personalized meal plans, professional consultations, and seamless nutrition tracking. Built with the **MVC (Model-View-Controller)** architecture, the platform ensures modular, scalable, and user-friendly development. It fosters effective communication between users, dietitians, admins, and organizations, providing educational resources and intuitive interfaces for informed dietary choices.

### Business Model
- **B2B**: Admins collaborate with dietitians and organizations to manage consultations and professional onboarding/verification.
- **B2C**: Users access tailored health services through tiered membership plans, offering varying levels of consultations and meal plans.

---

## Features

- **Dashboards**: Intuitive interfaces for users, admins, organizations, and dietitians to manage profiles, subscriptions, progress, and revenue.
- **Consultations**: Real-time chat and video conferencing with slot-based booking, conflict prevention, and user testimonials.
- **Meal Plans & Tracking**: Personalized meal plans and daily progress tracking (e.g., weight, water intake) for users and dietitians.
- **Blogs & Chatbot**: Blog uploads with thematic categorization and a static chatbot handling 100–150 predefined queries.
- **Medical Reports**: Dynamic submission and viewing of medical reports with support for multiple file uploads.
- **Pricing & Membership**: 
  - **No Plan**: 2 consultations/day, 4 meal plans.
  - **Basic**: 4 consultations/day, 8 meal plans.
  - **Premium**: 6 consultations/day, 8 meal plans.
  - **Ultimate**: 8 consultations/day, unlimited meal plans.
- **Revenue Tracking**: Admin dashboard for monitoring daily, monthly, and yearly revenue.
- **Queries**: User queries to admins with responses sent via Outlook or Gmail.
- **Verification**: Admins verify organizations, and organizations verify dietitians for professional credibility.

---

## Tech Stack

- **Frontend**: HTML, CSS, EJS, Bootstrap CSS for responsive and modern interfaces.
- **Backend**: Node.js, Express.js for robust API endpoints.
- **Database**: MongoDB with Mongoose for efficient data management.
- **Authentication**: Session-based with middleware for secure verification checks.

---

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/nutriconnect.git
   cd nutriconnect
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Create a `.env` File**:
   In the root directory, create a `.env` file with the following variables:
   ```plaintext
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/nutriconnect?retryWrites=true&w=majority
   SESSION_SECRET=your_session_secret_key
   NODE_ENV=development
   PORT=3000
   ```

4. **Start the Server**:
   ```bash
   npm start
   ```

5. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000`.

---

## Color Scheme

The color scheme is organized into three categories to define the visual identity of NutriConnect.

| **Primary Colors** | **Secondary Colors** | **Accent Colors** |
|--------------------|----------------------|-------------------|
| **Emerald Green**: `#50c878`<br>Main navigation bar, symbolizing health and vitality. | **White**: `#ffffff`<br>Text on dark backgrounds and general text for clarity. | **Light Gray**: `#f8f8f8`<br>Icons and subtle backgrounds for a clean aesthetic. |
| **Dark Green**: `#28a745`<br>Buttons and active states for a bold, actionable look. | **Dark Gray**: `rgb(51, 51, 51)`<br>Main text content for readability. | **Green Variation**: `#4CAF50`<br>Buttons for additional visual emphasis. |
| **Light Green**: `#D2F0C8`<br>Top header background for a fresh, calming effect. | | |

---

## Team Contributions

The NutriConnect platform was built through the collaborative efforts of the following team members, leveraging the MVC architecture for a robust and scalable solution.

### Pabbu Saketh 
- Developed dashboards for users, admins, organizations, and dietitians.
- Implemented verification workflows for organizations (by admins) and dietitians (by organizations).
- Built daily progress tracking and personalized meal plan functionality.
- **Schemas**: User, Organization, Admin, DietPlans, Progress.

### Nerella Venkata Sri Ram 
- Created real-time chat interface with video conferencing integration for client-dietitian communication.
- Built blog interface for URL/image uploads with thematic categorization.
- Developed static chatbot handling 100–150 predefined queries.
- **Schemas**: Chat, Chatbot, Blogs.

### Inala Syama Sri Sai
- Implemented booking system with slot management and conflict prevention.
- Developed diet plan search and dietitian filtering by language, fees, and location.
- Added testimonial functionality for user feedback.
- **Schemas**: Dietitian, DietitianInfo, BookedSlots.

### Nulakajodu Maanas Anand 
- Built medical report submission and viewing pages with multi-file upload support.
- Developed queries and contact us page with admin email responses via Outlook/Gmail.
- Managed user-admin query handling.
- **Schemas**: Queries, LabReports.

### Nitta Pradeep 
- Created pricing plans page (Basic, Premium, Ultimate) and consultation fees management.
- Built admin revenue tracking for daily, monthly, and yearly reports.
- Managed plan-based consultation and meal plan limits.
- **Schemas**: Subscription.

---

## Outcomes

NutriConnect delivers a **scalable, user-centric platform** that simplifies dietary planning and health management. The collaborative team efforts, combined with the MVC architecture, resulted in a robust application addressing diverse nutritional needs, with a foundation for future enhancements.

---

## Contact

For support or inquiries, reach out to our team at **nutriconnect6@gmail.com**.