# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Essential Commands

### Development
- `npm start` or `ng serve` - Start development server on http://localhost:4200
- `ng serve --open` - Start development server and open browser automatically
- `ng build --watch --configuration development` - Build in watch mode for development

### Building
- `npm run build` or `ng build` - Production build (outputs to `dist/`)
- `ng build --configuration development` - Development build with source maps

### Testing
- `npm test` or `ng test` - Run unit tests with Karma in watch mode
- `ng test --no-watch --browsers=ChromeHeadless` - Run tests once (useful for CI)
- `ng test --include="**/component-name.component.spec.ts"` - Run specific test file

### Code Generation
- `ng generate component feature/component-name` - Generate new component
- `ng generate service services/service-name` - Generate new service
- `ng generate guard guards/guard-name` - Generate route guard
- `ng generate --help` - See all available schematics

## Architecture Overview

This is an Angular 20 application using modern Angular features and patterns:

### Core Architecture
- **Standalone Components**: Uses Angular's standalone components (no NgModules)
- **Signals**: Leverages Angular signals for reactive state management
- **New Application Builder**: Uses `@angular/build:application` instead of legacy webpack builder
- **Bootstrap Pattern**: Application bootstrapped via `bootstrapApplication()` in `main.ts`

### Project Structure
- `src/app/app.ts` - Root standalone component using signals
- `src/app/app.config.ts` - Application configuration with providers
- `src/app/app.routes.ts` - Route definitions (currently empty)
- `src/main.ts` - Application bootstrap entry point

### Key Features
- **TypeScript**: Strict mode enabled with comprehensive compiler options
- **Prettier Integration**: Configured with 100-char line width and single quotes
- **Angular Router**: Configured but no routes defined yet
- **Zone.js**: Event coalescing enabled for better performance
- **Error Handling**: Global error listeners configured

### Development Patterns
- Components use standalone: true by default
- Signals used for reactive state (`signal()`, computed signals)
- Strict TypeScript configuration enforces best practices
- Modern ES2022 target with preserve module format

### Build Configuration
- Production builds have bundle budgets (500kB warning, 1MB error)
- Development builds include source maps and disable optimization
- Assets served from `public/` directory (Angular 20+ pattern)

## TypeScript Configuration

The project uses strict TypeScript settings:
- Strict mode enabled
- No implicit returns or fallthrough cases
- Property access from index signatures disabled
- Experimental decorators enabled for Angular

When adding new features, follow the existing patterns of standalone components and signal-based state management.
