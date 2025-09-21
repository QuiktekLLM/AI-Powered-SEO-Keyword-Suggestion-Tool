# Dependency Check CI Workflow

This document describes the dependency check CI workflow implemented for the AI-Powered SEO Keyword Suggestion Tool.

## Overview

The dependency check workflow helps ensure the project maintains secure and up-to-date dependencies, supporting the go-live checklist requirements for security, infrastructure monitoring, and automated dependency management.

## Workflows

### 1. Dependency Check Workflow (`dependency-check.yml`)

**Triggers:**
- Pull requests to main/master branches
- Pushes to main/master branches  
- Weekly schedule (Mondays at 9 AM UTC)
- Manual trigger via workflow_dispatch

**Jobs:**

#### Job 1: dependency-check
- **Security Audit**: Runs `npm audit --audit-level moderate` to check for security vulnerabilities
- **Dependency Updates**: Uses `npm-check-updates` to identify outdated dependencies
- **Test Validation**: Runs the full test suite after dependency checks
- **Reporting**: Generates comprehensive dependency reports in workflow summaries

#### Job 2: dependency-update (scheduled only)
- **Automated Updates**: Creates pull requests for dependency updates
- **Branch Creation**: Creates dated branches for dependency updates
- **Testing**: Validates that updates don't break existing functionality
- **PR Creation**: Uses GitHub CLI to create pull requests with detailed information

### 2. Basic CI Workflow (`ci.yml`)

**Triggers:**
- Push to main/master branches
- Pull requests to main/master branches

**Features:**
- Runs Jest test suite
- Generates test coverage reports
- Validates basic functionality

## Security Features

- **Vulnerability Scanning**: Automated detection of security vulnerabilities in dependencies
- **Moderate Severity**: Configured to catch moderate and higher severity issues
- **Regular Scans**: Weekly automated scans to stay current with new vulnerabilities

## Automation Features

- **Auto-Updates**: Weekly automated dependency update pull requests
- **Testing Integration**: All updates are tested before PR creation
- **Detailed Reports**: Comprehensive reporting in workflow summaries
- **Branch Management**: Automated branch creation with date-based naming

## Benefits

1. **Security Compliance**: Meets go-live checklist security requirements
2. **Infrastructure Monitoring**: Automated dependency health monitoring
3. **Reduced Manual Work**: Automated update proposals reduce maintenance overhead
4. **Quality Assurance**: All updates are tested before integration
5. **Visibility**: Clear reporting on dependency status and changes

## Usage

The workflows run automatically but can also be triggered manually:

```bash
# To manually check dependencies locally
npm audit --audit-level moderate
npx npm-check-updates

# To manually run tests
npm test
npm run test:coverage
```

## Configuration

The workflows are configured to work with:
- Node.js 18
- NPM package manager
- Jest testing framework
- GitHub Actions standard runners

## Monitoring

Check workflow status in the GitHub Actions tab. The dependency check workflow provides detailed summaries including:
- Security audit results
- Outdated dependency lists
- Full dependency reports
- Environment information