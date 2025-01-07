# ReservENSAM

ReservENSAM is a reservation management system designed for the École Nationale Supérieure des Arts et Métiers. It allows users to manage room reservations, view reservation statuses, and handle user profiles.

## Features

- **User Roles**: The system supports three user roles: CLUB, ADMIN, and ADEAM.
- **Room Reservations**: Users can make, view, and manage room reservations.
- **Approval Workflow**: Reservations go through an approval process involving ADEAM and ADMIN roles.
- **Profile Management**: Users can update their profiles, including contact information for CLUB roles.
- **PDF Generation**: Approved reservations can be downloaded as PDF documents.
- **Responsive Design**: The application is designed to be responsive and works well on mobile devices.

## Project Structure

### Server

- **Database Configuration**: The database schema is defined in `server/db_config`.
- **API Endpoints**: The server-side API endpoints handle various operations such as approving reservations, updating profiles, and fetching reservations.

### Client

- **HTML Files**: The main HTML files include `home.html` and `profile.html`.
- **CSS Files**: Styles are defined in `client/styles/general.css` and `client/styles/home.css`.
- **JavaScript Files**: Client-side logic is implemented in `client/scripts/home.js`, `client/scripts/profile.js`, and `client/scripts/general.js`.

## Database Schema

The database schema includes the following tables:

- `USER`: Stores user information.
- `ADMIN`, `ADEAM`, `CLUB`: Role-specific tables linked to the `USER` table.
- `ROOM`: Stores room information.
- `ROOM_UNAVAILABILITY`: Tracks room unavailability periods.
- `RESERVATION`: Stores reservation details.
- `TOKENS`: Manages user tokens for authentication.

## Installation

1. Clone the repository to your local machine.
2. Set up a local web server (e.g., XAMPP) and place the project in the `htdocs` directory.
3. Import the database schema from `server/db_config` into your MySQL database.
4. Update the database connection settings in the server-side scripts.
5. Start the web server and navigate to the project URL in your browser.

## Usage

- **Login**: Users can log in using their credentials.
- **Make Reservations**: CLUB users can make room reservations.
- **Approve/Reject Reservations**: ADEAM and ADMIN users can approve or reject reservations.
- **View Reservations**: Users can view their reservations and download approved reservations as PDFs.
- **Update Profile**: Users can update their profile information.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: PHP, MySQL
- **Libraries**: Flatpickr for date selection, pdfMake for PDF generation

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License.