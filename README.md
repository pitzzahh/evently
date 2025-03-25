<div align="center">
  <img src="https://raw.githubusercontent.com/pitzzahh/evently/refs/heads/main/static/favicon.png" alt="Evently Logo" width="200"/>
  <p style="font-size: 2em; font-weight: bold; margin: 0.5em 0;">Evently</p>
  <a href="https://github.com/pitzzahh/evently/actions/workflows/publish.yml">
    <img src="https://github.com/pitzzahh/evently/actions/workflows/publish.yml/badge.svg" alt="publish" />
  </a>

  <p>
    <strong>Evently</strong> is a powerful event attendance management system designed to simplify the process of organizing events and tracking participant attendance. With features such as QR code scanning, real-time attendance tracking, and comprehensive reporting, Evently helps event organizers streamline their workflow.
  </p>
</div>

## Features

### Event Management

- Create and manage single or multi-day events
- Set AM/PM time slots with specific start and end times
- Calendar view with Month, Week, Day, and Agenda perspectives
- Event status tracking (upcoming, ongoing, or completed)

### Participant Management

- Add individual participants to events
- Bulk import participants from Excel files
- Generate unique QR codes for each participant
- Send QR codes directly to participants via email

### Attendance Tracking

- Scan participant QR codes using hardware scanners or device camera
- Track AM and PM check-in/check-out times
- Real-time attendance status updates
- Comprehensive view of attendance statistics

### Reporting

- Export daily attendance reports to PDF
- Generate participant QR code sheets in PDF format
- Export full event attendance records to Excel or PDF
- Detailed attendance analytics and statistics

### Additional Features

- Automatic update notifications with in-app update functionality
- Offline-first architecture for reliable operation

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/evently.git

# Navigate to the project directory
cd evently

# Install dependencies
npm install
# or
bun install
# or
yarn install
```

## Usage

Start the development server:

```bash
npm run dev
# or
bun run dev
# or
yarn dev
```

For production builds:

```bash
npm run build
npm run preview
```

## Screenshots

<p align="center">
  <img src="events-screenshot.png" alt="Events list" width="45%"/>
  <img src="screenshot2.png" alt="Event Management" width="45%"/>
</p>
<p align="center">
  <img src="screenshot3.png" alt="Attendance Tracking" width="45%"/>
  <img src="screenshot4.png" alt="Reports" width="45%"/>
</p>

## Development

Evently is mainly built with:

- SvelteKit for the frontend
- shadcn-svelte for UI components
- Tauri for the cross-platform desktop application
- TailwindCSS for styling
- signaldbjs for real-time data synchronization using OPFS
- pdfmake for PDF generation
- react-big-calendar for the calendar component
- exceljs for Excel file handling
- svelte-put/qr for QR code generation
- react for rendering the calendar component
- and many more.

## Building for Desktop

Evently uses Tauri to create desktop applications:

```bash
npm run tauri build
```

This will produce executable files for your operating system in the `src-tauri/target/release` directory.

## License

MIT License
