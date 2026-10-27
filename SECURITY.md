# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

The AgriPassport team takes the security of agricultural supply-chain data seriously. If you discover a vulnerability or security flaw, please do NOT file a public issue on GitHub.

Instead, please send a responsible disclosure report to the team:
- **Project Lead:** Dharun Vijay M ([GitHub: @DharunVijay018](https://github.com/DharunVijay018))
- **Department:** Department of Computer Science and Engineering, Sri Sairam Engineering College

Include in your report:
1. Description of the vulnerability.
2. Steps to reproduce or proof-of-concept payload.
3. Potential impact on batch integrity or consumer privacy.
4. Suggested remediation if available.

We will review the issue within 48 hours and work with you to test and deploy a fix.

## Security Best Practices for Contributors

- **Zero Secret Commits**: Never commit `.env` files, Ethereum/Polygon private keys, or API credentials to Git.
- **Frontend Safety**: Any variable exposed via `VITE_` is readable by end users in client-side bundles. Never put secrets in `VITE_` variables.
- **Input Validation**: All API routes use server-side Zod schemas to reject malformed inputs before database persistence.
- **SQL Injection Prevention**: All database queries use parameterized SQL prepared statements.
