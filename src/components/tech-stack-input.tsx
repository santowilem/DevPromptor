import { useState, useRef, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

const TECH_SUGGESTIONS = [
  'react',
  'vue',
  'angular',
  'nextjs',
  'nuxt',
  'svelte',
  'solid',
  'typescript',
  'javascript',
  'python',
  'java',
  'csharp',
  'golang',
  'rust',
  'tailwind',
  'bootstrap',
  'material-ui',
  'ant-design',
  'chakra-ui',
  'bulma',
  'css',
  'scss',
  'styled-components',
  'emotion',
  'nodejs',
  'express',
  'fastapi',
  'django',
  'flask',
  'nestjs',
  'mongodb',
  'postgresql',
  'mysql',
  'redis',
  'sqlite',
  'graphql',
  'rest',
  'api',
  'websocket',
  'docker',
  'kubernetes',
  'aws',
  'azure',
  'gcp',
  'jest',
  'vitest',
  'cypress',
  'playwright',
  'webpack',
  'vite',
  'rollup',
  'esbuild',
  'prisma',
  'drizzle',
  'sequelize',
  'typeorm',
  'payloadcms',
  'strapi',
  'sanity',
  'contentful',
  'wordpress',
  'shopify',
  'gatsby',
];

interface TechStackInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function TechStackInput({ value, onChange }: TechStackInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toLowerCase();
    setInputValue(newValue);

    if (newValue) {
      const match = TECH_SUGGESTIONS.find(
        (tech) => tech.startsWith(newValue) && !value.includes(tech)
      );
      setSuggestion(match || '');
    } else {
      setSuggestion('');
    }
  };

  const addTech = (tech: string) => {
    if (tech && !value.includes(tech)) {
      onChange([...value, tech]);
    }
    setInputValue('');
    setSuggestion('');
  };

  const removeTech = (techToRemove: string) => {
    onChange(value.filter((tech) => tech !== techToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' || e.key === 'ArrowRight') {
      if (suggestion) {
        e.preventDefault();
        addTech(suggestion);
      }
    } else if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const techToAdd = suggestion || inputValue.trim();
      if (techToAdd) {
        addTech(techToAdd);
      }
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTech(value[value.length - 1]);
    }
  };

  return (
    <div className='space-y-2'>
      <Label htmlFor='tech-stack'>Technology Stack</Label>
      <div
        className={`flex flex-wrap gap-2 px-3 py-2 border rounded-md border-input bg-transparent dark:bg-input/30 shadow-xs transition-[color,box-shadow] items-center focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] h-[3.375rem]`}
      >
        {value.map((tech) => (
          <span
            key={tech}
            className='inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-primary-foreground rounded-md text-sm font-medium'
          >
            {tech}
            <button
              type='button'
              onClick={() => removeTech(tech)}
              className='hover:bg-primary/80 rounded-sm p-0.5 ml-0.5'
            >
              <X className='h-3 w-3' />
            </button>
          </span>
        ))}
        <div className='relative flex-1 min-w-[140px]'>
          <Input
            ref={inputRef}
            id='tech-stack'
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              value.length === 0
                ? 'Type technologies (e.g., react, typescript)...'
                : ''
            }
            className='border-none shadow-none p-0 h-auto focus-visible:ring-0 text-base md:text-sm !bg-transparent py-2'
          />
          {suggestion && inputValue && (
            <div className='absolute top-0 left-0 pointer-events-none text-muted-foreground/50 whitespace-nowrap overflow-hidden text-base md:text-sm py-2'>
              <span className='invisible'>{inputValue}</span>
              <span>{suggestion.slice(inputValue.length)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
