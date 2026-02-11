# DICOM Viewer

A web-based DICOM image viewer built with Next.js and CornerstoneJS.

## Features

- Drag-and-drop DICOM upload (`.dcm`)
- Medical image viewport with:
  - Window/level
  - Zoom
  - Pan
  - Mouse wheel stack scroll tool support
- DICOM tags modal with:
  - Search
  - Scrollable tag/value table
  - Mobile-friendly layout
- Reset view and refresh controls

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- CornerstoneJS (`@cornerstonejs/core`, `@cornerstonejs/tools`, `@cornerstonejs/dicom-image-loader`)
- `dicom-parser`

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev`: start local dev server
- `npm run build`: production build
- `npm run start`: run production server
- `npm run lint`: run lint checks
- `npm test`: run Jest tests

## Usage

1. Open the app in your browser.
2. Drop or select a DICOM file.
3. Use toolbar tools to inspect the image.
4. Open **DICOM Tags** to inspect metadata.

## Screenshots

### Main Viewer UI

![DICOM Viewer UI](https://github.com/user-attachments/assets/075e8b22-302d-4559-b5f6-4e424e3e69d1)

### Tags Search Modal

![DICOM Tags Modal](https://github.com/user-attachments/assets/dfef4add-b759-49b2-8c73-ea737999f88b)

## Notes

- Do not upload real patient-identifiable studies to untrusted environments.
