/**
 * Commitlint Configuration
 *
 * Enforces conventional commit messages for consistent git history.
 *
 * Format: <type>(<scope>): <subject>
 *
 * Types:
 * - feat: New feature
 * - fix: Bug fix
 * - docs: Documentation
 * - style: Formatting
 * - refactor: Code restructuring
 * - test: Adding tests
 * - chore: Maintenance
 * - hotfix: Emergency fix
 *
 * @see https://www.conventionalcommits.org/
 * @see https://commitlint.js.org/
 */

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allowed commit types
    'type-enum': [
      2, // Error level
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Formatting, semicolons, etc.
        'refactor', // Code restructuring
        'test', // Adding or updating tests
        'chore', // Maintenance tasks
        'hotfix', // Emergency production fix
        'ci', // CI/CD changes
        'perf', // Performance improvements
        'revert', // Reverting changes
      ],
    ],
    // Subject line rules
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-max-length': [2, 'always', 72],
    'subject-empty': [2, 'never'],
    // Type rules
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    // Body rules
    'body-max-line-length': [2, 'always', 100],
    // Header rules
    'header-max-length': [2, 'always', 100],
  },
}
