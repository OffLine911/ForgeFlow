# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.3.x   | :white_check_mark: |
| < 0.3.0 | :x:                |

## Reporting a Vulnerability

We take the security of ForgeFlow seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Disclose Publicly

Please do not open a public GitHub issue for security vulnerabilities. This helps protect users while we work on a fix.

### 2. Report Privately

Report security vulnerabilities by:
- Opening a [GitHub Security Advisory](https://github.com/YOUR_USERNAME/ForgeFlow/security/advisories/new)
- Or emailing: [YOUR_EMAIL] (if you prefer private email)

### 3. Include Details

Please include:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if you have one)
- Your contact information

### 4. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: Best effort

### 5. Disclosure Policy

- We will acknowledge your report within 48 hours
- We will provide regular updates on our progress
- We will notify you when the vulnerability is fixed
- We will credit you in the release notes (unless you prefer to remain anonymous)

## Security Best Practices

When using ForgeFlow:

### Local-First Security
- ForgeFlow runs entirely on your local machine
- No data is sent to external servers by default
- Workflows are stored locally in JSON format

### API Keys & Credentials
- Never commit API keys or credentials to workflows
- Use environment variables for sensitive data
- Be cautious when sharing workflows publicly

### Shell Commands
- Review shell command nodes carefully before execution
- Avoid running untrusted workflows from unknown sources
- Shell commands run with your user permissions

### File Operations
- File operations have access to your file system
- Review file paths in workflows before running
- Be cautious with delete/move operations

### Network Requests
- HTTP request nodes can access any URL
- Review webhook and API endpoints before use
- Be cautious with workflows that make external requests

### AI Integrations
- API keys for AI services are stored locally
- Review prompts before sending to AI services
- Be aware of data sent to external AI providers

## Known Security Considerations

### Workflow Execution
- Workflows run with your user privileges
- No sandboxing is currently implemented
- Exercise caution with workflows from untrusted sources

### Data Storage
- Workflows stored in plain JSON files
- No encryption at rest (planned for future)
- Sensitive data should not be hardcoded in workflows

### Updates
- Check for updates regularly
- Security patches are released as needed
- Subscribe to releases for notifications

## Future Security Enhancements

We are working on:
- [ ] Workflow sandboxing
- [ ] Encrypted storage for sensitive data
- [ ] Workflow signing and verification
- [ ] Permission system for file/network access
- [ ] Audit logging for sensitive operations

## Questions?

If you have questions about security that don't involve reporting a vulnerability, please open a regular GitHub issue or discussion.

---

Thank you for helping keep ForgeFlow and its users safe!
