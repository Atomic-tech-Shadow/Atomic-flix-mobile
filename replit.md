# Shadow Project

## Overview

This is a minimal static web application featuring a simple greeting page. The project consists of a single HTML page with French content displaying "salut je suis cid" (hello I am cid) with modern CSS styling including glassmorphism effects and gradient backgrounds.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a basic static website architecture:

- **Frontend Only**: Pure HTML/CSS implementation with no JavaScript framework
- **Static Content**: No server-side processing or dynamic content generation
- **Client-Side Rendering**: All content is rendered directly in the browser

## Key Components

### HTML Structure (`index.html`)
- Single-page application with minimal markup
- French language configuration (`lang="fr"`)
- Responsive viewport meta tag for mobile compatibility
- External CSS stylesheet linking

### Styling (`style.css`)
- Modern CSS with glassmorphism design pattern
- Responsive typography using `clamp()` function
- CSS Grid/Flexbox for layout centering
- Gradient backgrounds and backdrop filters for visual appeal
- Hover effects for interactive feedback

## Data Flow

Since this is a static website, there is no complex data flow:

1. Browser requests HTML file
2. HTML loads and references CSS stylesheet
3. CSS applies styling and visual effects
4. Content is displayed to user

## External Dependencies

- **None**: The project uses only native HTML and CSS
- **Fonts**: Relies on system Arial font (web-safe fallback)
- **No CDNs**: All assets are self-contained

## Deployment Strategy

The application can be deployed on any static hosting service:

- **Requirements**: Any web server capable of serving static files
- **Files Needed**: `index.html` and `style.css` in the same directory
- **No Build Process**: Files can be served directly without compilation
- **Hosting Options**: GitHub Pages, Netlify, Vercel, or any basic web hosting

### Current Structure
```
shadow/
├── index.html (main page)
└── style.css (styling)
```

The project is deployment-ready as-is and requires no additional configuration or build steps.