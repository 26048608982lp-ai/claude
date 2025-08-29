# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Soul Match - an international soulmate matching web application built with React and TypeScript. The app features a user-friendly grid-based interest selection system where users can select their interests and rate their importance level (1-5 stars). The system calculates compatibility between two users using a sophisticated matching algorithm and recommends personalized dating activities across cultures. The app is optimized for global deployment with comprehensive multi-language support and region-based localization.

## Development Commands

### Essential Commands
- `npm start` - Start development server on localhost:3000
- `npm run build` - Create production build in `build/` directory
- `npm test` - Run tests in interactive watch mode
- `npm run eject` - Eject from Create React App (one-way operation)

### Testing
- **Note**: Currently using Create React App's test setup with React Testing Library
- Tests are located in `src/__tests__` directory (if any)
- Run specific test file: `npm test filename.test.tsx`

### Deployment
- `vercel deploy --yes --prod` - Deploy to production Vercel environment
- `vercel deploy --yes` - Deploy to preview environment
- **EdgeOne Pages Deployment**: Use MCP tool `mcp__edgeone-pages-mcp-server__deploy_folder_or_zip` with the build directory

## Architecture Overview

### Core Components
1. **App.tsx** - Main orchestrator with stage-based navigation (welcome → enterName → user1 → share → user2 → results)
2. **InterestSelector.tsx** - Category-based interest selection with importance scoring (1-5 stars) using a grid layout
3. **MatchResults.tsx** - Comprehensive results display showing compatibility scores and activity recommendations
4. **SessionManager** - Handles persistent user sessions between both participants with Supabase integration
5. **Supabase Integration** - Provides reliable cross-device data sharing with short URL generation
6. **LanguageSwitcher.tsx** - Multi-language selector with region detection and persistent preferences

### Data Flow
- User inputs flow through App stage management with enhanced session handling
- Interest selection managed locally in each component with callbacks to parent
- SessionManager handles data persistence with localStorage and Supabase fallback
- MatchingEngine processes both users' interests to generate MatchResult
- Results include overall score, category scores, common/unique interests, and activity recommendations
- Supabase integration provides reliable cross-device data sharing via short URLs

### Key Architecture Patterns
- **Stage-based UI**: Single App component manages flow between welcome, name entry, interest selection, sharing, and results
- **Grid-based Selection**: User-friendly interest selection with category tabs and importance scoring
- **Algorithmic Matching**: Multi-dimensional scoring considering interest overlap and importance weights
- **Supabase Integration**: Reliable cross-device data sharing with short URL generation
- **Type Safety**: Comprehensive TypeScript interfaces for all data structures
- **Internationalization (i18n)**: Multi-language support with region detection and automatic localization

### Internationalization System
The app implements comprehensive internationalization using react-i18next:

#### **Supported Languages**
- **English (en)**: Default language, complete UI translation
- **简体中文 (zh)**: Simplified Chinese for mainland China users
- **Español (es)**: Spanish for international users
- **Français (fr)**: French for international users

#### **Region Detection & Auto-Switching**
- **Browser Language Detection**: Automatically detects user's browser language preferences
- **Mainland China Override**: Users from `zh-CN` region automatically see Chinese interface
- **Manual Language Switcher**: Floating language selector with native language names
- **Persistent Preferences**: User's language choice saved in localStorage

#### **Translation System**
- **Translation Files**: JSON-based translations in `src/locales/[lang]/translation.json`
- **Nested Key Structure**: Organized translation keys for better maintainability
- **TypeScript Support**: Proper typing for translation keys and parameters
- **Fallback Mechanism**: Graceful handling of missing translations with English fallback

#### **Localized Content**
- **UI Components**: All buttons, labels, forms, and navigation elements
- **Interest Categories**: Entertainment, Sports, Food, Travel with culturally relevant terms
- **Interest Items**: All 24 interest items translated across all supported languages
- **Activity Recommendations**: Dating activities and descriptions localized
- **Error Messages**: All error states and alerts translated
- **Match Results**: Compatibility scoring and relationship advice localized

#### **Cultural Adaptation**
- **Chinese Localization**: Simplified characters and China-specific terminology
- **Interest Categories**: Culturally relevant entertainment, food, and activity options
- **Dating Activities**: Recommendations appropriate for different cultural contexts
- **UI/UX Considerations**: Layout and design optimized for different languages

### Styling System
- **Tailwind CSS** with custom color palette (qixi-pink, qixi-purple, qixi-blue, qixi-gold)
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Glass-morphism**: Background blur effects for modern UI aesthetic

### Matching Algorithm Logic
The MatchingEngine class implements:
- **Category Scoring**: Calculates compatibility per interest category (entertainment, sports, food, travel)
- **Importance Weighting**: User-assigned importance (1-5) affects match scores
- **Activity Recommendations**: Pre-defined activities scored by category relevance and user interests
- **Result Generation**: Comprehensive match report with personalized suggestions

### Technical Considerations
- **React Hooks**: Extensive use of useState, useCallback, useEffect with proper dependency management
- **Supabase Integration**: Primary data storage with localStorage fallback for offline scenarios
- **TypeScript**: Strong typing throughout with interfaces for all data structures
- **No External State**: All state managed locally within components (no Redux/Context)
- **React Version**: Using React 18.3.1 for compatibility with Create React App 5.0.1
- **Internationalization**: Multi-language support (English, Chinese, Spanish, French) with region detection
- **Localization**: Automatic language switching for mainland China users (zh-CN → 简体中文)

### Development Notes
- ESLint treats warnings as errors in CI builds
- Vercel deployment configured with custom routing for SPA support
- Multi-language interface with emoji icons for visual appeal
- **i18n Framework**: Using react-i18next v12.3.1 for TypeScript compatibility
- **Language Detection**: Browser-based language detection with localStorage persistence
- **Translation Management**: JSON-based translation files with nested key structure
- **Project Structure**: Single React application in root directory with standard Create React App structure
- **React Version Compatibility**: Using React 18.3.1 for compatibility with Create React App 5.0.1 (React 19+ may cause blank page issues)
- **Supabase Setup**: Requires environment variables for cross-device data sharing
- **Short URL Generation**: Automatic generation of shareable links using Supabase

### File Structure
```
src/
├── components/
│   ├── LanguageSwitcher.tsx     # Multi-language selector component
│   ├── InterestSelector.tsx     # Localized interest selection
│   ├── MatchResults.tsx         # Localized match results display
│   └── ErrorBoundary.tsx       # Localized error handling
├── i18n/
│   └── index.ts                # i18next configuration with region detection
├── locales/
│   ├── en/
│   │   └── translation.json     # English translations
│   ├── zh/
│   │   └── translation.json     # Simplified Chinese translations
│   ├── es/
│   │   └── translation.json     # Spanish translations
│   └── fr/
│       └── translation.json     # French translations
├── utils/
│   ├── matchingEngine.ts       # Matching algorithm with localized activities
│   ├── sessionManager.ts       # Session management with UTF-8 support
│   └── supabase.ts            # Supabase integration
└── types/
    └── index.ts                # TypeScript interfaces
```

### Session Management
- `SessionManager` handles persistent user sessions between both participants
- **Supabase Integration**: Primary storage for cross-device data sharing with short URLs
- **Fallback Mechanism**: localStorage for offline scenarios and data backup
- **Short URL Generation**: Automatic creation of shareable links using Supabase
- **Session Validation**: Automatic cleanup of expired sessions (24-hour expiry)
- **Data Recovery**: Multiple fallback mechanisms for data integrity
- **International Support**: UTF-8 encoding for global character support
- **Multi-language Data**: All user-generated content supports international characters
- **Region Awareness**: Automatic interface adaptation based on user location
- **Language Preferences**: Persistent language selection across sessions

### Environment Variables
- `REACT_APP_SUPABASE_URL`: Supabase project URL for database connection
- `REACT_APP_SUPABASE_ANON_KEY`: Supabase anonymous key for API access
- Both variables required for full cross-device sharing functionality

### Environment Variables Troubleshooting

#### Vercel Deployment Issues
**Problem**: Vercel deployment shows "Invalid API key" error despite correct configuration
**Solution**: 
1. Delete existing environment variables in Vercel console
2. Manually re-add variables (don't copy-paste) to all environments (Development, Preview, Production)
3. Force re-deploy with `--force` flag to clear build cache
4. Verify connection through browser console logs

**Common Issues**:
- Environment variable encryption/decryption problems in Vercel
- Build cache containing old environment variable values
- Copy-paste introducing hidden characters or formatting issues
- Environment variables not applied to all deployment environments

#### Connection Testing
The app includes built-in Supabase connection testing:
- Automatic connection test on app startup
- Detailed error logging with status codes and hints
- Environment variable validation and debugging information
- Browser console shows connection status and error details