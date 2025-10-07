# Code Quality & Cursor Blob Setup

This project includes comprehensive code quality tools and configurations to help maintain clean, consistent, and high-quality code.

## 🛠️ Tools Included

### ESLint

- **Configuration**: `.eslintrc.json`
- **Purpose**: JavaScript/TypeScript linting
- **Rules**: Enforces code quality, catches potential bugs, maintains consistency

### Prettier

- **Configuration**: `.prettierrc` and `.prettierignore`
- **Purpose**: Code formatting
- **Features**: Consistent indentation, quotes, semicolons, line breaks

### TypeScript

- **Configuration**: `tsconfig.json`
- **Purpose**: Type checking and static analysis
- **Features**: Strict mode, comprehensive type checking

### VS Code Integration

- **Settings**: `.vscode/settings.json`
- **Extensions**: `.vscode/extensions.json`
- **Features**: Auto-format on save, ESLint integration, Tailwind CSS support

## 📋 Available Commands

### Code Quality Checks

```bash
# Run all quality checks (type-check + lint + format check)
npm run check

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check if code is properly formatted
npm run format:check

# Type checking only
npm run type-check

# Linting only
npm run lint
```

### Code Cleaning

```bash
# Clean build artifacts
npm run clean

# Comprehensive cleanup (recommended)
npm run clean:all

# Fix security vulnerabilities
npm run audit:fix
```

## 🎯 Cursor Blob Features

### Automatic Code Quality

- **Format on Save**: Code is automatically formatted when you save files
- **Lint on Save**: ESLint issues are automatically fixed when possible
- **Type Checking**: TypeScript errors are highlighted in real-time

### Code Standards

- **Consistent Formatting**: All code follows the same style guidelines
- **Type Safety**: TypeScript ensures type safety across the codebase
- **Best Practices**: ESLint enforces React/Next.js best practices
- **Error Prevention**: Catches potential bugs before they reach production

### Development Workflow

1. **Write Code**: Write your code normally
2. **Auto-Format**: Code is automatically formatted on save
3. **Auto-Fix**: ESLint issues are automatically fixed when possible
4. **Manual Review**: Review any remaining warnings/errors
5. **Quality Check**: Run `npm run check` before committing

## 🔧 Configuration Files

### `.eslintrc.json`

- Extends Next.js recommended rules
- Enforces consistent code style
- Catches common mistakes
- Warns about console statements (useful for production)

### `.prettierrc`

- Single quotes for strings
- Semicolons at end of statements
- 2-space indentation
- 80 character line width
- Trailing commas in objects/arrays

### `.cursorrules`

- Project-specific coding guidelines
- React/Next.js best practices
- Security recommendations
- Performance optimization tips

## 🚀 Getting Started

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Run Initial Cleanup**:

   ```bash
   npm run clean:all
   ```

3. **Check Code Quality**:

   ```bash
   npm run check
   ```

4. **Fix Issues** (if any):
   ```bash
   npm run fix
   ```

## 📊 Quality Metrics

The cursor blob helps maintain:

- ✅ **Consistent Code Style**: All files follow the same formatting rules
- ✅ **Type Safety**: TypeScript catches type errors at compile time
- ✅ **Best Practices**: ESLint enforces React/Next.js best practices
- ✅ **Error Prevention**: Catches potential bugs before deployment
- ✅ **Security**: Identifies potential security vulnerabilities
- ✅ **Performance**: Suggests performance optimizations

## 🔍 Troubleshooting

### Common Issues

1. **ESLint Errors**: Run `npm run lint:fix` to auto-fix most issues
2. **Formatting Issues**: Run `npm run format` to fix formatting
3. **Type Errors**: Fix TypeScript errors manually (they're usually helpful!)
4. **Build Issues**: Run `npm run clean` to clear build cache

### VS Code Setup

1. Install recommended extensions (see `.vscode/extensions.json`)
2. Reload VS Code window
3. Ensure Prettier and ESLint extensions are enabled

## 📈 Continuous Improvement

The cursor blob setup is designed to:

- **Learn from your code**: Adapts to your coding patterns
- **Suggest improvements**: Provides helpful suggestions
- **Maintain consistency**: Ensures all team members follow the same standards
- **Prevent regressions**: Catches issues before they reach production

## 🎉 Benefits

- **Faster Development**: Auto-fixing reduces manual work
- **Higher Quality**: Consistent standards improve code quality
- **Fewer Bugs**: Type checking and linting catch issues early
- **Better Collaboration**: Consistent code style improves team collaboration
- **Easier Maintenance**: Clean, well-formatted code is easier to maintain
