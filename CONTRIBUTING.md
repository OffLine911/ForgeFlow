# Contributing to ForgeFlow

Thanks for your interest in contributing to ForgeFlow! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ForgeFlow.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit with clear messages: `git commit -m "Add: feature description"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

### Prerequisites
- Go 1.21+
- Node.js 20+
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)

### Running Locally
```bash
# Install dependencies and run dev server
wails dev

# Frontend only
cd frontend && npm run dev
```

## Code Style

### TypeScript/React
- Use TypeScript strict mode
- Prefer functional components with hooks
- Use Zustand for state management
- Follow Tailwind CSS utility-first approach
- Use oklch colors for theming

### Go
- Follow standard Go conventions
- Run `go fmt` before committing
- Add comments for exported functions

## Commit Messages

Use clear, descriptive commit messages:
- `Add:` for new features
- `Fix:` for bug fixes
- `Update:` for changes to existing features
- `Refactor:` for code refactoring
- `Docs:` for documentation changes

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Update documentation if needed
- Add tests if applicable
- Ensure all tests pass
- Reference related issues

## Reporting Issues

When reporting bugs, please include:
- ForgeFlow version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## Feature Requests

We welcome feature requests! Please:
- Check existing issues first
- Describe the use case
- Explain why it would be useful
- Consider implementation complexity

## Questions?

Feel free to open an issue for questions or join discussions.

---

Thank you for contributing to ForgeFlow! 🚀
