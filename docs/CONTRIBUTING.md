# Contributing to ClipSync

Thank you for your interest in contributing to ClipSync! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow project coding standards

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Run tests: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to your branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Development Setup

See [GETTING-STARTED.md](docs/GETTING-STARTED.md) for detailed setup instructions.

## Coding Standards

### Backend (Node.js)
- Use ES6+ features
- Follow Express.js best practices
- Use async/await for asynchronous code
- Include error handling
- Add JSDoc comments for functions

### Frontend (React)
- Use functional components with hooks
- Follow React best practices
- Use TypeScript where applicable
- Keep components small and focused
- Use CSS modules or styled-components

### Testing
- Write tests for new features
- Aim for 70%+ code coverage
- Use descriptive test names
- Test both success and error cases

## Commit Messages

Follow conventional commits:

```
feat: add new feature
fix: fix bug
docs: update documentation
style: code formatting
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

## Pull Request Process

1. Ensure tests pass
2. Update documentation if needed
3. Add changelog entry
4. Request review from maintainers
5. Address review feedback
6. Merge when approved

## Project Structure

- `/backend` - Node.js/Express API
- `/clipsync-app` - React web application
- `/clipsync-desktop` - Electron desktop app
- `/clipsync-mobile` - React Native mobile app
- `/browser-extension` - Browser extensions
- `/docs` - Documentation

## Questions?

Open an issue or discussion on GitHub.

