import { ThemeToggle } from '@/components/theme-toggle';
import { PromptGenerator } from '@/components/prompt-generator';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DevPromptor - AI Prompt Generator for Coding Assistants',
  description:
    'DevPromptor helps developers generate high-quality, tool-optimized prompts for modern AI coding environments like Copilot, v0, Claude, and more. Write less. Prompt smart.',
  keywords: [
    'AI prompts',
    'GitHub Copilot',
    'Cursor AI',
    'Windsurf',
    'v0',
    'Claude',
    'ChatGPT',
    'coding assistant',
    'development tools',
  ],
  authors: [{ name: 'santowilem' }],
  openGraph: {
    title: 'DevPromptor - AI Prompt Generator for Coding Assistants',
    description:
      'DevPromptor helps developers generate high-quality, tool-optimized prompts for modern AI coding environments like Copilot, v0, Claude, and more. Write less. Prompt smart.',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 grid grid-rows-[auto_1fr_auto]'>
      {/* Header */}
      <header className='mx-auto max-w-3xl w-full'>
        <div className='text-center space-y-2 py-8'>
          <h1 className='text-4xl font-bold tracking-tight'>DevPromptor</h1>
          <p className='text-base text-muted-foreground'>
            AI Prompt Generator for Coding Assistants
          </p>
        </div>
      </header>

      {/* Main Content */}
      <PromptGenerator />

      {/* Footer - Sticky at bottom */}
      <footer className='text-center text-sm text-muted-foreground py-4'>
        <div className='flex items-center justify-center flex-col gap-1 mt-3'>
          <p className='text-base text-muted-foreground'>
            Write less. Prompt smart.
          </p>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
}
