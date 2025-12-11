# Pointify Admin Dashboard

## Overview

Pointify Admin is a POS (Point of Sale) admin dashboard that provides management capabilities for products, categories, and inventory. The application connects to an external Pointify API (`staging.pointifypos.com`) as the backend, with this codebase serving as a React-based frontend with a lightweight Express proxy server.

The dashboard follows modern design patterns inspired by Linear, Stripe Dashboard, and Material Design principles, focusing on efficiency and clarity for data-heavy operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite

### Backend Architecture
- **Server**: Express.js acting as a proxy/BFF (Backend for Frontend)
- **Pattern**: The server proxies requests to the external Pointify API at `staging.pointifypos.com`
- **Session Management**: In-memory session storage for authentication tokens (per user session using `X-Session-Id` header)
- **No direct database**: The application relies entirely on the external Pointify API for data persistence

### Authentication Flow
1. User submits credentials to `/api/auth/login`
2. Server proxies to Pointify API and stores the returned JWT token in memory
3. Subsequent requests include the session ID header to retrieve stored tokens
4. Server attaches the token to proxied API requests

### Directory Structure
- `/client` - React frontend application
  - `/src/pages` - Page components (login, dashboard, products, categories)
  - `/src/components` - Reusable components including shadcn/ui library
  - `/src/lib` - Utilities, API client, auth context
  - `/src/hooks` - Custom React hooks
- `/server` - Express backend
  - `routes.ts` - API routes that proxy to Pointify API
  - `storage.ts` - Simple in-memory user storage (minimal usage)
- `/shared` - Shared TypeScript types and schemas

### Design System
- Font: Inter (Google Fonts)
- Component library: shadcn/ui (New York style variant)
- Color scheme: Neutral base with primary blue accent
- Layout: Fixed sidebar (256px) with flexible main content area

## External Dependencies

### External API
- **Pointify API** (`https://staging.pointifypos.com`): The primary backend service handling all business logic, data storage, and authentication
  - Authentication endpoints
  - Product management
  - Category management
  - Dashboard statistics

### Key Frontend Libraries
- `@tanstack/react-query` - Data fetching and caching
- `@radix-ui/*` - Accessible UI primitives
- `react-hook-form` + `zod` - Form validation
- `lucide-react` - Icon library
- `tailwindcss` - Utility CSS framework

### Database
- **Drizzle ORM** is configured with PostgreSQL (`drizzle.config.ts`), but the current implementation primarily uses the external Pointify API rather than a local database
- Schema file exists at `shared/schema.ts` containing TypeScript interfaces (not Drizzle table definitions currently)

### Build & Development
- Vite for development server and production builds
- esbuild for server bundling
- TypeScript for type safety throughout