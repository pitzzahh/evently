<div align="center">
  <img src="https://raw.githubusercontent.com/pitzzahh/evently/refs/heads/main/static/favicon.png" alt="Evently Logo" width="200"/>
  <!-- <p style="font-size: 2em; font-weight: bold; margin: 0.5em;">Evently</p> -->
  <h1>Evently</h1>
  <a href="https://github.com/pitzzahh/evently/actions/workflows/publish.yml">
    <img src="https://github.com/pitzzahh/evently/actions/workflows/publish.yml/badge.svg" alt="publish" />
  </a>

  <p>
    <strong>Evently</strong> is an event attendance management system that helps organize events and track participant attendance. It offers QR code scanning, attendance tracking, and reporting features to assist event organizers with their workflow.
  </p>
</div>

## Download

Check the [latest release](https://github.com/pitzzahh/evently/releases/latest) for the most up-to-date version.

Available for:

- Windows
- macOS
- Linux

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

### Reporting

- Export daily attendance reports to PDF
- Generate participant QR code sheets in PDF format
- Export full event attendance records to Excel or PDF

### Additional Features

- Automatic update notifications with in-app update functionality
- Offline-first architecture for reliable operation

## Installation

```bash
# Clone the repository
git clone https://github.com/pitzzahh/evently.git

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
bun tauri dev
# or
npm run tauri dev
#or
pnpm run tauri dev
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

- [SvelteKit](https://github.com/sveltejs/kit) for the frontend
- [shadcn-svelte](https://github.com/huntabyte/shadcn-svelte) for UI components
- [Tauri](https://tauri.app/) for the cross-platform desktop application
- [TailwindCSS](https://github.com/tailwindlabs/tailwindcss) for styling
- [signaldb](https://github.com/maxnowack/signaldb) for real-time data synchronization using OPFS
- [pdfmake](https://github.com/bpampuch/pdfmake) for PDF generation
- [react-big-calendar](https://github.com/jquense/react-big-calendar) for the calendar component
- [exceljs](https://github.com/exceljs/exceljs) for Excel file handling
- [svelte-put/qr](https://svelte-put.vnphanquang.com/docs/qr) for QR code generation
- [React](https://github.com/facebook/react) for rendering the calendar component
- and many more.

## Building for Desktop

Evently uses Tauri to create desktop applications:

```bash
npm run tauri build
```

This will produce executable files for your operating system in the `src-tauri/target/release` directory.

## License

MIT License
