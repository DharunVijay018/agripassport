# Contributing to AgriPassport

Thank you for your interest in contributing to **AgriPassport: AI-Powered Blockchain Digital Passport for Farm-to-Fork Traceability**!

This project was developed as part of the **Innovative Design Lab–I** course at **Sri Sairam Engineering College** by:
- **Dharun Vijay M** (Team Leader, Reg No: `2503412510421063`)
- **Bharani R** (Team Member, Reg No: `2503412510421047`)
- **Mithilesh N** (Team Member, Reg No: `2503412510421159`)

---

## Code of Conduct & Contribution Guidelines

1. **Academic Integrity & Honesty**:
   - Do not claim that blockchain transactions are verified on a live mainnet unless actual contracts are deployed and verified.
   - The default mode is `mock`, providing complete local SHA-256 cryptographic verification without requiring testnet tokens.
   - Do not commit real private keys or personal data.

2. **Branching Strategy**:
   - `main`: Production-ready, stable codebase.
   - `develop`: Ongoing development and feature integration.
   - Feature branches: `feature/feature-name` or `fix/bug-name`.

3. **Commit Message Format**:
   Follow conventional commits:
   - `feat: add batch QR code download support`
   - `fix: correct timestamp validation in event service`
   - `docs: update technical design with state diagram`
   - `test: add unit tests for SHA-256 merkle hash recalculation`

4. **Development Setup**:
   ```bash
   # Clone the repo
   git clone https://github.com/DharunVijay018/agripassport.git
   cd agripassport

   # Install dependencies
   npm install

   # Setup environment
   cp .env.example .env

   # Seed development database
   npm run seed

   # Run tests
   npm test

   # Start development servers
   npm run dev
   ```

5. **Reporting Issues**:
   - Use GitHub Issues to submit bug reports or feature requests.
   - Provide steps to reproduce, expected behavior, and actual behavior.
