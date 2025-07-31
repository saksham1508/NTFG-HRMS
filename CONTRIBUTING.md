# Contributing to NTFG HRMS

First off, thank you for considering contributing to NTFG HRMS! It's people like you that make NTFG HRMS such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Process

### Setting up your development environment

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/ntfg-hrms.git`
3. Install dependencies: `npm run install:all`
4. Set up environment variables (copy `.env.example` to `.env`)
5. Start development servers: `npm run dev`

### Making Changes

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Add tests for your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to your branch: `git push origin feature/your-feature-name`
8. Submit a pull request

### Coding Standards

- Use meaningful variable and function names
- Write comments for complex logic
- Follow the existing code style
- Use TypeScript where applicable
- Write tests for new features
- Update documentation as needed

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Example:
```
Add AI-powered resume screening feature

- Implement OpenAI integration for resume analysis
- Add skill extraction and matching algorithms
- Include confidence scoring for recommendations
- Update API documentation

Fixes #123
```

### Testing

- Write unit tests for new functions
- Write integration tests for new API endpoints
- Ensure all tests pass before submitting PR
- Aim for high test coverage

### Documentation

- Update README.md if needed
- Update API documentation for new endpoints
- Add inline code comments for complex logic
- Update installation guide if setup changes

## Project Structure

```
NTFG_HRMS/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
├── server/                 # Node.js backend
│   ├── middleware/         # Express middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── utils/             # Server utilities
└── docs/                  # Documentation
```

## Style Guides

### JavaScript Style Guide

- Use ES6+ features
- Use const/let instead of var
- Use arrow functions where appropriate
- Use template literals for string interpolation
- Use destructuring for objects and arrays

### React Style Guide

- Use functional components with hooks
- Use meaningful component names
- Keep components small and focused
- Use PropTypes or TypeScript for type checking
- Use CSS-in-JS or CSS modules for styling

### Git Commit Messages

- Use the present tense
- Use the imperative mood
- Limit the first line to 72 characters
- Reference issues and pull requests

## Recognition

Contributors will be recognized in the following ways:

- Listed in the README.md contributors section
- Mentioned in release notes for significant contributions
- Given credit in commit messages and pull requests

## Questions?

Don't hesitate to ask questions by creating an issue or reaching out to the maintainers.

Thank you for contributing to NTFG HRMS! 🎉