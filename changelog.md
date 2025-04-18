# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.47] - 2025-3-30

### Add

- New event calendar UI, migrated from original UI.
- Updated to TailwindCSS v4.
- Added event cover photo preview functionality.
- Implemented participant QR code photo preview.

### Fix

- CI Build failing to generate environment files due to GitHub Actions read-only permissions.
- Various components affected by TailwindCSS migration.

## [1.5.42] - 2025-3-27

### Fix

- Missing embedded envs on production builds.
- Animations when changing event tabs from upcoming/past.

## [1.5.40] - 2025-3-27

### Feat

- Added new background images and dynamic themes.
- Integrated QR code generation and email sending for participants.
- Enabled hardware scanner functionality.
- Enhanced search input styling, tooltips, and hover effects.
- Added Cloudinary API to upload participants' QR codes.

### Fix

- Corrected class attribute formatting and toast messages.
- Updated message event types and environment variable configurations.
- Improved QR code generation visibility and date formatting.
- Resolved issues with participant QR code integration and file input restrictions.
- Simplified message data parsing and state management.
- Streamlined QR code handling and file upload processes.
- Updated Google Drive and authentication utility functions.
- Removed unused imports and dependencies.
- Enhanced README documentation and license information.
- Correct attendance status logic for participant event days.
- Refine logic for counting incomplete event days.
- Update QR code scanner to stop camera when dialog is closed.
- Add stop camera functionality and refine button styles in QR code scanner dialog.

## [1.4.25] - 2025-3-24

### Add

- Late time calculation logic to ensure accurate time tracking for time-in periods.
- Email notification feature for participants with their QR codes for attendance.

### Fix

- Scanning logic of participants to allow scanning ahead of time while ensuring it's within the event date range.
- Background gradient display issues.

## [1.4.18] - 2025-3-24

### Add

- Search for events.

### Feat

- In app updates.

## [1.3.15] - 2025-3-24

### Add

- App logo and icons.

### Feat

- Export full event attendance report to pdf and excel.

## [1.2.11] - 2025-3-24

### Add

- Event image cover upload feature.
- Event image cover display in event card.

### Fix

- Daily attendance report generation logic to ensure correct data retrieval.
- Calendar of events to ensure correct date display.
- Event list infinite scroll failing circleci build.

### Feat

- Camera option for QR code scanning.
- Toggle option between camera and hardware scanner for QR code scanning.

## [1.1.3] - 2025-3-12

### Add

- Events list feature
- Participant management with validation
- QR code generation and PDF export
- Daily attendance report generation
- Participant import from Excel file
- File upload handling with validation
- Event calendar component
- Participant attendance tracking with barcode scanning
- Confirmation dialog for participant import
- Error handling for PDF generation
- Toast notifications for user feedback
- Dynamic column rendering in data tables
- Participant data table with actions (edit, view, remove)
- Event status display and management
- Participant attendance status calculation
- File system capabilities for read and write permissions
- Fullscreen toggle functionality
- Event details display with time and location labels
- Participant floating bar with bulk delete functionality
- Enhanced dialog support with @tauri-apps/plugin-dialog

### Improve

- Theme consistency with updated color variables
- File upload handling with dialog integration
- Participant data rendering in tables
- Error handling in QR code and PDF generation
- User feedback with toast notifications
- Participant import process with success notification
- Participant attendance display with last scanned participant info
- Event status checks and display
- Participant form validation and management
- Participant data table actions with edit, view, and remove functionalities

### Fix

- Duplicate success messages for report and QR code generation
- Error handling in PDF generation logic
- Syntax for CommandPrimitive.Separator in command-separator.svelte
- Sticky bug
- Typo in PDF header for participant QR codes
- QR code worker import path
- Redundant file system capability from default.json
- File upload handling to support File objects
- Worksheet retrieval to use index instead of name
- End_date assignment in event-form for accurate scheduling
- Debug console logs from event form component
- Event filtering logic to correctly handle upcoming and past events
- Date filtering from event list query to fetch all events
- Optional event details in participant dialog
- Column accessor for middle name
- Event query logic to use Date objects directly for improved accuracy
- Positioning of status pill in event card component
- Event card display with date badges
- Event fetching logic for improved clarity
- Unused props from EventForm component
- Button interaction by adding active scaling effect
- Validation logic for am end and pm start
- Event time picker styling and layout for improved usability
- Cancel function that caused field errors not to show

## [0.1.2] - 2025-2-26

### Fix

- Dotenvs cargo dependency version to match the valid version from crates.io.

## [0.1.1] - 2025-2-26

### Fix

- Missing development script in package.json required by CI/CD.

## [0.1.0] - 2025-2-26

### Add

- Initial project setup.
- Initial changelog implementation.
