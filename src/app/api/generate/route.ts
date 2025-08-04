import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

function getToolDisplayName(tool: string): string {
  const toolNames: Record<string, string> = {
    'github-copilot': 'GitHub Copilot (VS Code)',
    cursor: 'Cursor AI',
    windsurf: 'Windsurf',
    v0: 'v0 by Vercel',
    claude: 'Claude (Anthropic)',
    chatgpt: 'ChatGPT',
    general: 'General AI Assistant',
  };
  return toolNames[tool] || 'AI Assistant';
}

function getToolSpecificInstructions(tool: string): string {
  const instructions: Record<string, string> = {
    'github-copilot': `For GitHub Copilot in VS Code, create instructions that work well with:
- Inline code suggestions and completions
- Chat-based code generation
- Context-aware suggestions
- VS Code workspace integration`,

    cursor: `For Cursor AI, optimize for:
- Multi-file editing capabilities
- AI-assisted refactoring
- Code generation with context awareness
- Intelligent code suggestions`,

    windsurf: `For Windsurf, focus on:
- Collaborative AI coding
- Project-wide understanding
- Advanced code generation
- Multi-language support`,

    v0: `For v0 by Vercel, emphasize:
- React component generation
- Next.js integration
- UI/UX focused development
- Modern web development practices`,

    claude: `For Claude (Anthropic), structure for:
- Detailed reasoning and explanation
- Step-by-step code generation
- Best practices and documentation
- Thorough analysis and planning`,

    chatgpt: `For ChatGPT, optimize for:
- Conversational code generation
- Iterative development approach
- Clear explanations and examples
- Multi-step problem solving`,

    general: `For general AI assistants, ensure:
- Clear, detailed instructions
- Technology-specific guidance
- Best practices inclusion
- Comprehensive context`,
  };
  return instructions[tool] || instructions['general'];
}

function getOutputFormatInstructions(tool: string): string {
  const formats: Record<string, string> = {
    'github-copilot': `Generate the output in this EXACT format for GitHub Copilot (VS Code). You MUST replace ALL placeholder text with actual content:

## Main Prompt
Create a comprehensive main prompt that includes the project overview, requirements, and technology stack details.

## Custom Instructions (.github/copilot-instructions.md)
\`\`\`markdown
# GitHub Copilot (VS Code) Custom Instructions

## Project Overview
Write a detailed description of the project, its purpose, and main goals. Be specific about what the application does and who it serves.

## Technology Stack
List the specific technologies, frameworks, libraries, and tools to use with version preferences. **If a version is not specified, always use the latest stable version available.** Include frontend, backend, database, and tooling choices.

## Coding Guidelines
Specify detailed coding standards, best practices, code organization, naming conventions, and documentation requirements for this specific project.

## Project Structure
Define the exact folder structure, file organization, and directory layout that should be followed throughout the project.

## Code Style Preferences
Detail formatting preferences, indentation, naming conventions for variables/functions/classes, import organization, and file structure patterns.

## Dependencies and Libraries
List preferred libraries, packages, utility functions, and third-party integrations with specific usage guidelines and configuration details.

## Testing Requirements
Specify testing frameworks, test types (unit, integration, e2e), coverage requirements, testing patterns, and mock strategies.

## Performance Considerations
List performance optimization techniques, caching strategies, bundling preferences, and efficiency guidelines specific to the tech stack.

## Security Guidelines
Detail security best practices, authentication patterns, data protection, input validation, and vulnerability prevention measures.
\`\`\`

## Workspace Instructions (.instructions.md)
\`\`\`markdown
---
applyTo: "**"
description: "Project-specific coding instructions"
---

# Workspace Instructions

## Development Workflow
Describe the complete development process including git workflow, branch naming, commit conventions, code review process, and deployment steps.

## File Templates
Provide specific templates and boilerplate code for common file types in this project (components, services, models, tests, etc.).

## Common Patterns
List reusable code patterns, design patterns, architectural patterns, and project-specific code snippets with examples.

## Error Handling
Define comprehensive error handling strategies, logging practices, debugging approaches, and error reporting mechanisms.

## API Guidelines
If applicable, specify API design principles, endpoint patterns, request/response formats, authentication, and documentation standards.

## Database Guidelines
If applicable, specify database schema patterns, query optimization, migration strategies, and data modeling approaches.

## Deployment Guidelines
Describe deployment processes, environment configurations, CI/CD setup, and release procedures.

## Troubleshooting
List common issues, their root causes, step-by-step solutions, and debugging techniques specific to this project.
\`\`\`

CRITICAL: Replace ALL descriptive text with actual, detailed, project-specific content. Do not include any placeholder text like [brackets] or generic descriptions.`,

    cursor: `Generate the output in this EXACT format for Cursor AI. You MUST replace ALL placeholder text with actual content:

## Main Prompt
Create a comprehensive main prompt that includes the project overview, requirements, and technology stack details.

## Cursor Rules (.cursor/rules)
\`\`\`markdown
---
description: "Project-specific AI coding rules"
globs: 
alwaysApply: true
---

# Project Rules

## Project Overview
Write a detailed description of the project, its purpose, and main goals. Be specific about what the application does and who it serves.

## Technology Stack
List the specific technologies, frameworks, libraries, and tools to use with version preferences. **If a version is not specified, always use the latest stable version available.** Include frontend, backend, database, and tooling choices.

## Coding Guidelines
Specify detailed coding standards, best practices, code organization, naming conventions, and documentation requirements for this specific project.

## Project Structure
Define the exact folder structure, file organization, and directory layout that should be followed throughout the project.

## Code Style Preferences
Detail formatting preferences, indentation, naming conventions for variables/functions/classes, import organization, and file structure patterns.

## Dependencies and Libraries
List preferred libraries, packages, utility functions, and third-party integrations with specific usage guidelines and configuration details.

## Testing Requirements
Specify testing frameworks, test types (unit, integration, e2e), coverage requirements, testing patterns, and mock strategies.

## Performance Considerations
List performance optimization techniques, caching strategies, bundling preferences, and efficiency guidelines specific to the tech stack.

## Security Guidelines
Detail security best practices, authentication patterns, data protection, input validation, and vulnerability prevention measures.
\`\`\`

## Code Generation Rules (.cursor/rules/code-generation.mdc)
\`\`\`markdown
---
description: "Code generation and modification guidelines"
globs: "**/*.{js,ts,jsx,tsx,py,java,cpp,go,rs}"
alwaysApply: false
---

# Code Generation Guidelines

## Development Workflow
Describe the complete development process including git workflow, branch naming, commit conventions, code review process, and deployment steps.

## File Templates
Provide specific templates and boilerplate code for common file types in this project (components, services, models, tests, etc.).

## Common Patterns
List reusable code patterns, design patterns, architectural patterns, and project-specific code snippets with examples.

## Error Handling
Define comprehensive error handling strategies, logging practices, debugging approaches, and error reporting mechanisms.

## API Guidelines
If applicable, specify API design principles, endpoint patterns, request/response formats, authentication, and documentation standards.

## Database Guidelines
If applicable, specify database schema patterns, query optimization, migration strategies, and data modeling approaches.

## Deployment Guidelines
Describe deployment processes, environment configurations, CI/CD setup, and release procedures.

## Troubleshooting
List common issues, their root causes, step-by-step solutions, and debugging techniques specific to this project.
\`\`\`

CRITICAL: Replace ALL descriptive text with actual, detailed, project-specific content. Do not include any placeholder text like [brackets] or generic descriptions.`,

    windsurf: `Generate the output optimized for Windsurf:

## Main Prompt
[Primary prompt for Windsurf]

## Windsurf-Specific Configuration
[Instructions tailored for Windsurf's collaborative features]`,

    v0: `Generate the output optimized for v0 by Vercel:

## Main Prompt
[Primary prompt for v0 component generation]

## Component Guidelines
[Specific guidelines for React component generation with v0]`,

    claude: `Generate the output optimized for Claude:

## Main Prompt
[Detailed, structured prompt for Claude]

## Additional Context
[Comprehensive background and reasoning]`,

    chatgpt: `Generate the output optimized for ChatGPT:

## Main Prompt
[Conversational prompt for ChatGPT]

## Follow-up Instructions
[Guidelines for iterative development]`,

    general: `Generate a comprehensive prompt suitable for various AI tools:

## Main Prompt
[Universal prompt that works across different AI assistants]`,
  };
  return formats[tool] || formats['general'];
}

function parseCursorOutput(text: string) {
  console.log('=== CURSOR PARSING DEBUG ===');
  console.log('Input text length:', text.length);
  console.log('Input text preview:', text.substring(0, 500));

  const files = {
    mainPrompt: '',
    copilotInstructions: '', // We'll reuse these keys for consistency
    workspaceInstructions: '',
  };

  // More robust parsing approach
  try {
    // 1. Extract Main Prompt
    const mainPromptMatch = text.match(
      /##\s*Main Prompt\s*\n([\s\S]*?)(?=##|\n##|$)/i
    );
    if (mainPromptMatch) {
      files.mainPrompt = mainPromptMatch[1].trim();
      console.log('Main prompt found:', files.mainPrompt.length, 'characters');
    }

    // 2. Extract Cursor Rules - look for markdown block
    const cursorRulesMatch = text.match(
      /##\s*(?:Cursor Rules).*?\n```markdown\s*\n([\s\S]*?)\n```/i
    );
    if (cursorRulesMatch) {
      files.copilotInstructions = cursorRulesMatch[1].trim();
      console.log(
        'Cursor rules found:',
        files.copilotInstructions.length,
        'characters'
      );
    } else {
      // Fallback: look for section without markdown wrapper
      const cursorRulesFallback = text.match(
        /##\s*(?:Cursor Rules).*?\n([\s\S]*?)(?=##\s*Code Generation Rules|$)/i
      );
      if (cursorRulesFallback) {
        let content = cursorRulesFallback[1].trim();
        // Remove markdown wrapper if present
        content = content
          .replace(/^```markdown\s*\n/, '')
          .replace(/\n```\s*$/, '');
        files.copilotInstructions = content.trim();
        console.log(
          'Cursor rules (fallback):',
          files.copilotInstructions.length,
          'characters'
        );
      }
    }

    // 3. Extract Code Generation Rules - look for markdown block
    const codeGenMatch = text.match(
      /##\s*Code Generation Rules.*?\n```markdown\s*\n([\s\S]*?)\n```/i
    );
    if (codeGenMatch) {
      files.workspaceInstructions = codeGenMatch[1].trim();
      console.log(
        'Code generation rules found:',
        files.workspaceInstructions.length,
        'characters'
      );
    } else {
      // Fallback: look for section without markdown wrapper
      const codeGenFallback = text.match(
        /##\s*Code Generation Rules.*?\n([\s\S]*?)$/i
      );
      if (codeGenFallback) {
        let content = codeGenFallback[1].trim();
        // Remove markdown wrapper if present
        content = content
          .replace(/^```markdown\s*\n/, '')
          .replace(/\n```\s*$/, '');
        files.workspaceInstructions = content.trim();
        console.log(
          'Code generation rules (fallback):',
          files.workspaceInstructions.length,
          'characters'
        );
      }
    }

    // If nothing was found, generate basic content
    if (
      !files.mainPrompt &&
      !files.copilotInstructions &&
      !files.workspaceInstructions
    ) {
      console.log('No structured content found, using fallback');
      files.mainPrompt = text;
      files.copilotInstructions = `---
description: "Project-specific AI coding rules"
globs: 
alwaysApply: true
---

# Project Rules

## Project Overview
AI-generated coding project with modern development practices.

## Technology Stack
- Use the latest stable versions of specified technologies
- Follow modern framework patterns and conventions
- Implement responsive design principles

## Coding Guidelines
- Write clean, maintainable, and well-documented code
- Use modern syntax and patterns
- Implement proper error handling
- Follow established project conventions
- Ensure type safety where applicable

## Code Style Preferences
- Use consistent indentation and formatting
- Follow naming conventions for variables, functions, and files
- Organize imports and dependencies logically
- Write descriptive comments for complex logic

## Testing Requirements
- Implement comprehensive unit tests
- Use appropriate testing frameworks
- Maintain good test coverage
- Write integration tests for critical paths

## Performance Considerations
- Optimize for speed and efficiency
- Implement caching where appropriate
- Minimize bundle size and load times
- Use performance monitoring tools`;

      files.workspaceInstructions = `---
description: "Code generation and modification guidelines"
globs: "**/*.{js,ts,jsx,tsx,py,java,cpp,go,rs}"
alwaysApply: false
---

# Code Generation Guidelines

## Development Workflow
1. Follow git best practices with descriptive commit messages
2. Use feature branches for new development
3. Conduct code reviews before merging
4. Maintain clean and organized project structure

## Common Patterns
- Use consistent file and folder naming conventions
- Implement reusable components and utilities
- Follow established architectural patterns
- Maintain separation of concerns

## Error Handling
- Implement comprehensive error handling
- Use appropriate logging mechanisms
- Provide meaningful error messages
- Handle edge cases gracefully

## Troubleshooting
- Check console for error messages
- Verify dependencies are installed correctly
- Ensure environment variables are configured
- Review documentation for common issues`;
    }
  } catch (error) {
    console.error('Cursor parsing error:', error);
    files.mainPrompt = text;
  }

  console.log('=== CURSOR PARSING COMPLETE ===');
  console.log('Final files structure:');
  console.log('- mainPrompt:', files.mainPrompt.length, 'characters');
  console.log('- cursorRules:', files.copilotInstructions.length, 'characters');
  console.log(
    '- codeGenerationRules:',
    files.workspaceInstructions.length,
    'characters'
  );

  return files;
}

function parseGitHubCopilotOutput(text: string) {
  console.log('=== PARSING DEBUG ===');
  console.log('Input text length:', text.length);
  console.log('Input text preview:', text.substring(0, 500));

  const files = {
    mainPrompt: '',
    copilotInstructions: '',
    workspaceInstructions: '',
  };

  // More robust parsing approach
  try {
    // 1. Extract Main Prompt
    const mainPromptMatch = text.match(
      /##\s*Main Prompt\s*\n([\s\S]*?)(?=##|\n##|$)/i
    );
    if (mainPromptMatch) {
      files.mainPrompt = mainPromptMatch[1].trim();
      console.log('Main prompt found:', files.mainPrompt.length, 'characters');
    }

    // 2. Extract Copilot Instructions - look for markdown block
    const copilotMatch = text.match(
      /##\s*(?:GitHub Copilot Instructions|Custom Instructions).*?\n```markdown\s*\n([\s\S]*?)\n```/i
    );
    if (copilotMatch) {
      files.copilotInstructions = copilotMatch[1].trim();
      console.log(
        'Copilot instructions found:',
        files.copilotInstructions.length,
        'characters'
      );
    } else {
      // Fallback: look for section without markdown wrapper
      const copilotFallback = text.match(
        /##\s*(?:GitHub Copilot Instructions|Custom Instructions).*?\n([\s\S]*?)(?=##\s*Workspace Instructions|$)/i
      );
      if (copilotFallback) {
        let content = copilotFallback[1].trim();
        // Remove markdown wrapper if present
        content = content
          .replace(/^```markdown\s*\n/, '')
          .replace(/\n```\s*$/, '');
        files.copilotInstructions = content.trim();
        console.log(
          'Copilot instructions (fallback):',
          files.copilotInstructions.length,
          'characters'
        );
      }
    }

    // 3. Extract Workspace Instructions - look for markdown block
    const workspaceMatch = text.match(
      /##\s*Workspace Instructions.*?\n```markdown\s*\n([\s\S]*?)\n```/i
    );
    if (workspaceMatch) {
      files.workspaceInstructions = workspaceMatch[1].trim();
      console.log(
        'Workspace instructions found:',
        files.workspaceInstructions.length,
        'characters'
      );
    } else {
      // Fallback: look for section without markdown wrapper
      const workspaceFallback = text.match(
        /##\s*Workspace Instructions.*?\n([\s\S]*?)$/i
      );
      if (workspaceFallback) {
        let content = workspaceFallback[1].trim();
        // Remove markdown wrapper if present
        content = content
          .replace(/^```markdown\s*\n/, '')
          .replace(/\n```\s*$/, '');
        files.workspaceInstructions = content.trim();
        console.log(
          'Workspace instructions (fallback):',
          files.workspaceInstructions.length,
          'characters'
        );
      }
    }

    // If nothing was found, generate basic content
    if (
      !files.mainPrompt &&
      !files.copilotInstructions &&
      !files.workspaceInstructions
    ) {
      console.log('No structured content found, using fallback');
      files.mainPrompt = text;
      files.copilotInstructions = `# GitHub Copilot (VS Code) Custom Instructions

## Project Overview
AI-generated coding project with modern development practices.

## Technology Stack
- Use the latest stable versions of specified technologies
- Follow modern framework patterns and conventions
- Implement responsive design principles

## Coding Guidelines
- Write clean, maintainable, and well-documented code
- Use modern syntax and patterns
- Implement proper error handling
- Follow established project conventions
- Ensure type safety where applicable

## Code Style Preferences
- Use consistent indentation and formatting
- Follow naming conventions for variables, functions, and files
- Organize imports and dependencies logically
- Write descriptive comments for complex logic

## Testing Requirements
- Implement comprehensive unit tests
- Use appropriate testing frameworks
- Maintain good test coverage
- Write integration tests for critical paths

## Performance Considerations
- Optimize for speed and efficiency
- Implement caching where appropriate
- Minimize bundle size and load times
- Use performance monitoring tools`;

      files.workspaceInstructions = `---
applyTo: "**"
description: "Project-specific coding instructions"
---

# Workspace Instructions

## Development Workflow
1. Follow git best practices with descriptive commit messages
2. Use feature branches for new development
3. Conduct code reviews before merging
4. Maintain clean and organized project structure

## Common Patterns
- Use consistent file and folder naming conventions
- Implement reusable components and utilities
- Follow established architectural patterns
- Maintain separation of concerns

## Error Handling
- Implement comprehensive error handling
- Use appropriate logging mechanisms
- Provide meaningful error messages
- Handle edge cases gracefully

## Troubleshooting
- Check console for error messages
- Verify dependencies are installed correctly
- Ensure environment variables are configured
- Review documentation for common issues`;
    }
  } catch (error) {
    console.error('Parsing error:', error);
    files.mainPrompt = text;
  }

  console.log('=== PARSING COMPLETE ===');
  console.log('Final files structure:');
  console.log('- mainPrompt:', files.mainPrompt.length, 'characters');
  console.log(
    '- copilotInstructions:',
    files.copilotInstructions.length,
    'characters'
  );
  console.log(
    '- workspaceInstructions:',
    files.workspaceInstructions.length,
    'characters'
  );

  return files;
}

export async function POST(req: NextRequest) {
  try {
    const { title, stack, requirements, selectedAiTool, action } =
      await req.json();

    let prompt = '';

    if (action === 'generate') {
      const toolSpecificInstructions =
        getToolSpecificInstructions(selectedAiTool);

      prompt = `You are an expert at creating high-quality prompts for AI coding assistants.

Create a comprehensive prompt for the following developer request, optimized for ${getToolDisplayName(
        selectedAiTool
      )}:

Title: ${title}
AI Tool: ${getToolDisplayName(selectedAiTool)}
Technology Stack: ${stack.join(', ')}
Requirements: ${requirements}

${toolSpecificInstructions}

Please create a clear, actionable prompt that:
1. Clearly states the objective
2. Specifies the tech stack and tools to use
3. Outlines specific requirements and features
4. Includes any constraints or best practices
5. Is optimized for the selected AI tool
6. Uses the latest versions of mentioned technologies

${getOutputFormatInstructions(selectedAiTool)}`;
    } else if (action === 'enhance') {
      if (selectedAiTool === 'github-copilot') {
        prompt = `You are an expert at improving prompts for AI coding assistants, specifically GitHub Copilot. Please enhance the following three-part prompt structure to make it more effective:

${requirements}

Please improve all three sections by:
1. Making each section more specific and actionable
2. Adding missing technical details that would be helpful
3. Structuring each section better for AI comprehension
4. Including relevant best practices or constraints
5. Ensuring they follow prompt engineering best practices
6. Optimizing specifically for GitHub Copilot in VS Code
7. Ensuring use of latest versions of technologies mentioned

Maintain the exact same structure with:
- ## Main Prompt section
- ## GitHub Copilot Instructions section (in markdown code block)
- ## Workspace Instructions section (in markdown code block)

Enhance the content while keeping the format identical.`;
      } else if (selectedAiTool === 'cursor') {
        prompt = `You are an expert at improving prompts for AI coding assistants, specifically Cursor AI. Please enhance the following three-part prompt structure to make it more effective:

${requirements}

Please improve all three sections by:
1. Making each section more specific and actionable
2. Adding missing technical details that would be helpful
3. Structuring each section better for AI comprehension
4. Including relevant best practices or constraints
5. Ensuring they follow prompt engineering best practices
6. Optimizing specifically for Cursor AI
7. Ensuring use of latest versions of technologies mentioned

Maintain the exact same structure with:
- ## Main Prompt section
- ## Cursor Rules section (in markdown code block)
- ## Code Generation Rules section (in markdown code block)

Enhance the content while keeping the format identical.`;
      } else {
        prompt = `You are an expert at improving prompts for AI coding assistants. Please enhance the following prompt to make it more effective for ${getToolDisplayName(
          selectedAiTool
        )}:

${requirements}

Please improve this prompt by:
1. Making it more specific and actionable
2. Adding missing technical details that would be helpful
3. Structuring it better for AI comprehension
4. Including relevant best practices or constraints
5. Ensuring it follows prompt engineering best practices
6. Optimizing it for ${getToolDisplayName(selectedAiTool)}
7. Ensuring use latest versions of technologies mentioned`;
      }
    }

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
    });

    // For GitHub Copilot, parse and return separate files for both generate and enhance actions
    if (
      selectedAiTool === 'github-copilot' &&
      (action === 'generate' || action === 'enhance')
    ) {
      const files = parseGitHubCopilotOutput(text);
      return NextResponse.json({
        result: text,
        files: files,
      });
    }

    // For Cursor, parse and return separate files for both generate and enhance actions
    if (
      selectedAiTool === 'cursor' &&
      (action === 'generate' || action === 'enhance')
    ) {
      const files = parseCursorOutput(text);
      return NextResponse.json({
        result: text,
        files: files,
      });
    }

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}
