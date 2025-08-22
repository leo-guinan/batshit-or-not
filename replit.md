# Batshit or Not

## Overview

Batshit or Not is a community-driven web application where users can submit their wildest ideas and have them rated by other users on a "batshit crazy" scale from 1-10. The platform combines social interaction with gamification elements, allowing users to discover trending ideas, build reputation through submissions and ratings, and engage with creative content across various categories.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built as a React single-page application using modern development tools:
- **React with TypeScript** for type-safe component development
- **Vite** as the build tool and development server for fast hot reloading
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query** for server state management, caching, and API interactions
- **Tailwind CSS** with CSS variables for responsive, utility-first styling
- **Shadcn/ui** component library built on Radix UI primitives for accessible, customizable components

The application follows a mobile-first design approach with a bottom navigation bar and card-based layout optimized for social media-style browsing.

### Backend Architecture
The server uses a Node.js/Express architecture with TypeScript:
- **Express.js** as the web framework with middleware for JSON parsing and request logging
- **RESTful API** design with route handlers organized by feature (ideas, ratings, auth)
- **Database abstraction layer** using a storage interface pattern for clean separation of concerns
- **PostgreSQL** as the primary database with connection pooling via Neon serverless
- **Session-based authentication** with PostgreSQL session storage

### Data Architecture
The database schema is defined using Drizzle ORM with PostgreSQL:
- **Users table** storing profile information (required for Replit Auth integration)
- **Ideas table** with fields for content, category, anonymity flag, and rating aggregates
- **Ratings table** for individual user ratings with referential integrity
- **UserStats table** for tracking user engagement metrics and reputation
- **Sessions table** for secure session management

Key design decisions include denormalized rating averages on ideas for performance, soft anonymity options, and comprehensive user statistics tracking.

### Authentication System
The application uses Replit's OpenID Connect authentication:
- **OAuth 2.0/OpenID Connect** integration with Replit's identity provider
- **Passport.js** strategy for handling authentication flows
- **Session-based auth** with secure HTTP-only cookies
- **PostgreSQL session store** for distributed session management
- **User profile synchronization** with automatic user creation/updates

### State Management
Client-side state is managed through multiple specialized systems:
- **TanStack Query** for server state, caching, and optimistic updates
- **React Context** for authentication state and user information
- **Local component state** for UI interactions and form handling
- **URL state** via Wouter for navigation and routing

### API Design
The REST API follows conventional HTTP patterns:
- **GET /api/ideas** - Fetch ideas with filtering (fresh, trending, hall-of-fame)
- **POST /api/ideas** - Submit new ideas with validation
- **POST /api/ratings** - Submit ratings with duplicate prevention
- **GET /api/auth/user** - Fetch current user profile
- **Authentication middleware** protecting user-specific endpoints

Error handling includes structured error responses, request/response logging, and graceful fallbacks for unauthenticated users.

## External Dependencies

### Core Technologies
- **Neon Database** - Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM** - Type-safe database toolkit with migration support
- **React ecosystem** - Component library, hooks, and development tools
- **Node.js runtime** - Server execution environment with ESM module support

### UI and Styling
- **Radix UI** - Unstyled, accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework with custom design tokens
- **Lucide React** - Icon library for consistent visual elements
- **Custom fonts** - Google Fonts integration (Architects Daughter, DM Sans, Fira Code, Geist)

### Authentication
- **Replit Auth** - OAuth 2.0 identity provider integration
- **OpenID Client** - Standard-compliant authentication library
- **Passport.js** - Authentication middleware and strategy system
- **Express Session** - Session management with PostgreSQL storage

### Development Tools
- **TypeScript** - Static type checking and enhanced developer experience
- **Vite** - Fast build tool with HMR and optimized bundling
- **ESBuild** - Fast JavaScript bundler for production builds
- **PostCSS** - CSS processing with Tailwind and Autoprefixer

### Deployment
- **Replit hosting** - Integrated development and deployment platform
- **Environment variables** - Secure configuration management for database URLs and secrets
- **Static asset serving** - Optimized client bundle delivery