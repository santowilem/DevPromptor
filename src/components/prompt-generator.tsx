'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TechStackInput } from '@/components/tech-stack-input';
import {
  Wand2,
  Sparkles,
  Copy,
  Check,
  Trash2,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

// Custom hook for sticky copy button
function useStickyButton() {
  const [scrollTop, setScrollTop] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleScroll = () => {
      setScrollTop(textarea.scrollTop);
    };

    textarea.addEventListener('scroll', handleScroll);
    return () => textarea.removeEventListener('scroll', handleScroll);
  }, []);

  return { scrollTop, textareaRef };
}

export function PromptGenerator() {
  const [title, setTitle] = useState('');
  const [stack, setStack] = useState<string[]>([]);
  const [requirements, setRequirements] = useState('');

  // Sticky button hooks for each textarea
  const mainPromptSticky = useStickyButton();
  const copilotSticky = useStickyButton();
  const workspaceSticky = useStickyButton();
  const generatedPromptSticky = useStickyButton();
  const [selectedAiTool, setSelectedAiTool] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<{
    mainPrompt: string;
    copilotInstructions: string;
    workspaceInstructions: string;
  }>({ mainPrompt: '', copilotInstructions: '', workspaceInstructions: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Follow-up chat state
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      type: 'user' | 'assistant';
      content: string;
      timestamp: Date;
    }>
  >([]);

  // Step navigation state
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoSaved, setIsAutoSaved] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('main'); // For Copilot tabs
  const [showClearDialog, setShowClearDialog] = useState(false);
  const totalSteps = 2;

  // Save form data to localStorage
  const saveFormData = useCallback(
    (showAutoSaved = false) => {
      try {
        const formData = {
          title,
          stack,
          requirements,
          selectedAiTool,
          generatedPrompt,
          generatedFiles,
          chatMessages,
          currentStep,
          activeTab,
          timestamp: new Date().toISOString(),
        };

        localStorage.setItem(
          'promptGeneratorFormData',
          JSON.stringify(formData)
        );

        if (showAutoSaved) {
          setIsAutoSaved(true);
          setLastSaveTime(new Date());
          setTimeout(() => setIsAutoSaved(false), 2000); // Hide after 2 seconds
        }
      } catch (error) {
        console.error('Failed to save form data:', error);
        // Don't show error toast for storage issues as it may be expected (incognito mode, etc.)
      }
    },
    [
      title,
      stack,
      requirements,
      selectedAiTool,
      generatedPrompt,
      generatedFiles,
      chatMessages,
      currentStep,
      activeTab,
    ]
  );

  // Save user input data only (triggers auto-save notification)
  const saveUserInputData = useCallback(() => {
    saveFormData(true);
  }, [saveFormData]);

  // Save navigation state silently (no auto-save notification)
  const saveNavigationState = useCallback(() => {
    saveFormData(false);
  }, [saveFormData]);

  // Load form data from localStorage
  // Load saved data on component mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('promptGeneratorFormData');
      if (savedData) {
        try {
          const formData = JSON.parse(savedData);
          // Only auto-restore if there's meaningful data
          const hasContent =
            formData.title ||
            formData.requirements ||
            formData.generatedPrompt ||
            formData.stack?.length > 0 ||
            formData.chatMessages?.length > 0;

          if (hasContent) {
            setTitle(formData.title || '');
            setStack(formData.stack || []);
            setRequirements(formData.requirements || '');
            setSelectedAiTool(formData.selectedAiTool || '');
            setGeneratedPrompt(formData.generatedPrompt || '');
            setGeneratedFiles(
              formData.generatedFiles || {
                mainPrompt: '',
                copilotInstructions: '',
                workspaceInstructions: '',
              }
            );
            setChatMessages(
              (formData.chatMessages || []).map(
                (msg: {
                  id: string;
                  type: 'user' | 'assistant';
                  content: string;
                  timestamp: string | Date;
                }) => ({
                  ...msg,
                  timestamp: msg.timestamp
                    ? new Date(msg.timestamp)
                    : new Date(),
                })
              )
            );
            setCurrentStep(formData.currentStep || 1);
            setActiveTab(formData.activeTab || 'main');
            if (formData.timestamp) {
              setLastSaveTime(new Date(formData.timestamp));
            }
          }
        } catch (parseError) {
          console.error('Failed to parse saved form data:', parseError);
          // Clear corrupted data
          localStorage.removeItem('promptGeneratorFormData');
        }
      }
    } catch (storageError) {
      console.error('Failed to access localStorage:', storageError);
    }
  }, []);

  // Save data when user input fields change (debounced, with auto-save notification)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        saveUserInputData();
      } catch (error) {
        console.error('Error saving user input data:', error);
      }
    }, 500); // Save after 500ms of no changes

    return () => clearTimeout(timer);
  }, [title, stack, requirements, selectedAiTool, saveUserInputData]);

  // Save navigation state immediately when step or tab changes (silent save)
  useEffect(() => {
    try {
      saveNavigationState();
    } catch (error) {
      console.error('Error saving navigation state:', error);
    }
  }, [currentStep, activeTab, saveNavigationState]);

  // Save generated content when it changes (silent save)
  useEffect(() => {
    if (generatedPrompt || generatedFiles.mainPrompt) {
      try {
        saveNavigationState();
      } catch (error) {
        console.error('Error saving generated content:', error);
      }
    }
  }, [generatedPrompt, generatedFiles, saveNavigationState]);

  const clearAll = () => {
    setShowClearDialog(true);
  };

  const handleClearConfirm = () => {
    setTitle('');
    setStack([]);
    setRequirements('');
    setSelectedAiTool('');
    setGeneratedPrompt('');
    setGeneratedFiles({
      mainPrompt: '',
      copilotInstructions: '',
      workspaceInstructions: '',
    });
    setChatMessages([]);
    setCurrentStep(1);
    setActiveTab('main');
    setLastSaveTime(null);

    // Clear localStorage
    try {
      localStorage.removeItem('promptGeneratorFormData');
      toast.success('All data cleared successfully!');
    } catch (error) {
      console.error('Failed to clear form data:', error);
      toast.error('Failed to clear saved data.');
    }

    setShowClearDialog(false);
  };

  const handleClearCancel = () => {
    setShowClearDialog(false);
  };

  // Check if there's any data to clear
  const hasDataToClear =
    title.trim() !== '' ||
    stack.length > 0 ||
    requirements.trim() !== '' ||
    selectedAiTool !== '' ||
    generatedPrompt !== '' ||
    generatedFiles.mainPrompt !== '' ||
    generatedFiles.copilotInstructions !== '' ||
    generatedFiles.workspaceInstructions !== '' ||
    chatMessages.length > 0;

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const generatePrompt = async (action: 'generate' | 'enhance') => {
    if (
      !title.trim() ||
      stack.length === 0 ||
      !requirements.trim() ||
      !selectedAiTool
    ) {
      toast.error(
        'Please fill in the title, select an AI tool, at least one technology, and requirements.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          stack,
          requirements:
            action === 'enhance'
              ? selectedAiTool === 'github-copilot'
                ? `## Main Prompt\n${
                    generatedFiles.mainPrompt || generatedPrompt
                  }\n\n## GitHub Copilot Instructions\n\`\`\`markdown\n${
                    generatedFiles.copilotInstructions
                  }\n\`\`\`\n\n## Workspace Instructions\n\`\`\`markdown\n${
                    generatedFiles.workspaceInstructions
                  }\n\`\`\``
                : selectedAiTool === 'cursor'
                ? `## Main Prompt\n${
                    generatedFiles.mainPrompt || generatedPrompt
                  }\n\n## Cursor Rules\n\`\`\`markdown\n${
                    generatedFiles.copilotInstructions
                  }\n\`\`\`\n\n## Code Generation Rules\n\`\`\`markdown\n${
                    generatedFiles.workspaceInstructions
                  }\n\`\`\``
                : generatedPrompt
              : requirements,
          selectedAiTool,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const data = await response.json();

      if (
        (selectedAiTool === 'github-copilot' || selectedAiTool === 'cursor') &&
        data.files
      ) {
        setGeneratedFiles({
          mainPrompt: data.files.mainPrompt || '',
          copilotInstructions: data.files.copilotInstructions || '',
          workspaceInstructions: data.files.workspaceInstructions || '',
        });
        setGeneratedPrompt(data.files.mainPrompt || data.result);
      } else {
        setGeneratedPrompt(data.result);
        setGeneratedFiles({
          mainPrompt: data.result,
          copilotInstructions: '',
          workspaceInstructions: '',
        });
      }

      toast.success(
        action === 'generate'
          ? 'Prompt generated successfully!'
          : 'Prompt enhanced successfully!'
      );

      // Move to next step after generating prompt
      if (action === 'generate') {
        goToNextStep();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (
    text: string,
    successMessage: string = 'Copied to clipboard!'
  ) => {
    try {
      // Try modern clipboard API first
      if (typeof window !== 'undefined' && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(text);
          toast.success(successMessage);
          return true;
        } catch (clipboardError) {
          console.log(
            'Clipboard API failed, trying fallback...',
            clipboardError
          );
        }
      }

      // Fallback method
      if (typeof window !== 'undefined') {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          toast.success(successMessage);
          return true;
        }
      }

      throw new Error('Copy failed');
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast.error(
        'Failed to copy to clipboard. Please select and copy manually.'
      );
      return false;
    }
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Navigation */}
      <nav
        className='flex justify-center mb-6 flex-shrink-0'
        role='navigation'
        aria-label='Main navigation'
      >
        <div className='flex items-center space-x-1 bg-muted p-1 rounded-lg'>
          <button
            onClick={() => setCurrentStep(1)}
            aria-pressed={currentStep === 1}
            className={`px-4 text-sm font-medium rounded-md transition-all h-[3.375rem] flex items-center ${
              currentStep === 1
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Prompt Configuration
          </button>
          <button
            onClick={() => setCurrentStep(2)}
            disabled={!generatedPrompt && !generatedFiles.mainPrompt}
            aria-pressed={currentStep === 2}
            className={`px-4 text-sm font-medium rounded-md transition-all h-[3.375rem] flex items-center ${
              currentStep === 2
                ? 'bg-background text-foreground shadow-sm'
                : !generatedPrompt && !generatedFiles.mainPrompt
                ? 'text-muted-foreground/50 cursor-not-allowed'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Generated Prompt
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className='mx-auto max-w-3xl w-full flex-1 min-h-0 overflow-hidden'>
        <Card className='overflow-hidden w-full flex flex-col'>
          {/* Step 1: Prompt Configuration */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <div>Prompt Configuration</div>
                  <div className='flex items-center space-x-3 text-xs'>
                    {isAutoSaved && (
                      <div className='flex items-center text-green-600 dark:text-green-400'>
                        <Check className='h-3 w-3 mr-1' />
                        Auto-saved
                      </div>
                    )}
                    {lastSaveTime && !isAutoSaved && (
                      <div className='text-muted-foreground'>
                        Last saved: {lastSaveTime.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  Define your requirements to generate an optimized AI prompt
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6 flex-1 overflow-y-auto'>
                <section aria-labelledby='ai-tool-section'>
                  <div className='space-y-2'>
                    <Label id='ai-tool-section'>AI Tool</Label>
                    <Select
                      value={selectedAiTool}
                      onValueChange={setSelectedAiTool}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select your AI coding assistant' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='github-copilot'>
                          GitHub Copilot (VS Code)
                        </SelectItem>
                        <SelectItem value='cursor'>Cursor AI</SelectItem>
                        <SelectItem value='windsurf'>Windsurf</SelectItem>
                        <SelectItem value='v0'>v0 by Vercel</SelectItem>
                        <SelectItem value='claude'>
                          Claude (Anthropic)
                        </SelectItem>
                        <SelectItem value='chatgpt'>ChatGPT</SelectItem>
                        <SelectItem value='general'>
                          General AI Assistant
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </section>

                <section aria-labelledby='title-section'>
                  <div className='space-y-2'>
                    <Label htmlFor='title' id='title-section'>
                      Title
                    </Label>
                    <Input
                      id='title'
                      placeholder='e.g., React Task Management App'
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                </section>

                <section aria-labelledby='tech-stack-section'>
                  <TechStackInput value={stack} onChange={setStack} />
                </section>

                <section aria-labelledby='requirements-section'>
                  <div className='space-y-2'>
                    <Label htmlFor='requirements' id='requirements-section'>
                      Requirements
                    </Label>
                    <Textarea
                      id='requirements'
                      placeholder='Describe what you want to build or accomplish...'
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      className='min-h-24'
                      rows={4}
                    />
                  </div>
                </section>

                {/* <section aria-labelledby='ai-tool-section'>
                  <div className='space-y-2'>
                    <Label id='ai-tool-section'>AI Tool</Label>
                    <Select
                      value={selectedAiTool}
                      onValueChange={setSelectedAiTool}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select your AI coding assistant' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='github-copilot'>
                          GitHub Copilot (VS Code)
                        </SelectItem>
                        <SelectItem value='cursor'>Cursor AI</SelectItem>
                        <SelectItem value='windsurf'>Windsurf</SelectItem>
                        <SelectItem value='v0'>v0 by Vercel</SelectItem>
                        <SelectItem value='claude'>
                          Claude (Anthropic)
                        </SelectItem>
                        <SelectItem value='chatgpt'>ChatGPT</SelectItem>
                        <SelectItem value='general'>
                          General AI Assistant
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </section> */}

                {/* Action Buttons */}
                <div className='flex gap-3 pt-4'>
                  <Button
                    onClick={clearAll}
                    variant='outline'
                    disabled={isLoading || !hasDataToClear}
                    className='flex-1'
                  >
                    <Trash2 className='h-4 w-4 mr-2' />
                    Clear All
                  </Button>
                  <Button
                    onClick={() => generatePrompt('generate')}
                    disabled={isLoading}
                    className='flex-1'
                  >
                    {isLoading ? (
                      <>
                        <div className='animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2' />
                        {generatedPrompt || generatedFiles.mainPrompt
                          ? 'Regenerating...'
                          : 'Generating...'}
                      </>
                    ) : generatedPrompt || generatedFiles.mainPrompt ? (
                      <>
                        <RotateCcw className='h-4 w-4 mr-2' />
                        Regenerate Prompt
                      </>
                    ) : (
                      <>
                        <Wand2 className='h-4 w-4 mr-2' />
                        Generate Prompt
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
          {/* Step 2: Generated Prompt */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle>Generated Prompt</CardTitle>
                <CardDescription>
                  Your AI-optimized prompt ready for coding assistants
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4 flex-1 overflow-hidden flex flex-col'>
                {(selectedAiTool === 'github-copilot' ||
                  selectedAiTool === 'cursor') &&
                generatedFiles.copilotInstructions ? (
                  <>
                    {/* Tab Navigation */}
                    <nav
                      className='flex items-center space-x-1 bg-muted p-1 rounded-lg'
                      role='tablist'
                      aria-label='Generated prompt tabs'
                    >
                      <button
                        id='main-prompt-tab'
                        onClick={() => setActiveTab('main')}
                        role='tab'
                        aria-selected={activeTab === 'main'}
                        aria-controls='main-prompt-panel'
                        className={`px-3 text-sm font-medium rounded-md transition-all flex-1 text-center h-[3.375rem] flex items-center justify-center ${
                          activeTab === 'main'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Main Prompt
                      </button>
                      <button
                        id='copilot-tab'
                        onClick={() => setActiveTab('copilot')}
                        role='tab'
                        aria-selected={activeTab === 'copilot'}
                        aria-controls='copilot-prompt-panel'
                        className={`px-3 text-sm font-medium rounded-md transition-all flex-1 text-center h-[3.375rem] flex items-center justify-center ${
                          activeTab === 'copilot'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {selectedAiTool === 'cursor'
                          ? '.cursor/rules.mdc'
                          : '.github/copilot-instructions.md'}
                      </button>
                      {generatedFiles.workspaceInstructions && (
                        <button
                          id='workspace-tab'
                          onClick={() => setActiveTab('workspace')}
                          role='tab'
                          aria-selected={activeTab === 'workspace'}
                          aria-controls='workspace-prompt-panel'
                          className={`px-3 text-sm font-medium rounded-md transition-all flex-1 text-center h-[3.375rem] flex items-center justify-center ${
                            activeTab === 'workspace'
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {selectedAiTool === 'cursor'
                            ? '.cursor/rules/code-generation.mdc'
                            : '.instructions.md'}
                        </button>
                      )}
                    </nav>

                    {/* Tab Content */}
                    <section className='flex-1 min-h-[0]'>
                      {activeTab === 'main' && (
                        <div
                          id='main-prompt-panel'
                          role='tabpanel'
                          aria-labelledby='main-prompt-tab'
                          className='relative group h-full'
                        >
                          <Textarea
                            ref={mainPromptSticky.textareaRef}
                            value={generatedFiles.mainPrompt}
                            readOnly
                            className='font-mono text-sm resize-none h-full pr-12'
                          />
                          <Button
                            size='icon'
                            variant='outline'
                            className='absolute right-2 opacity-30 group-hover:opacity-100 transition-opacity z-10'
                            style={{
                              top: `${Math.max(
                                8,
                                mainPromptSticky.scrollTop + 8
                              )}px`,
                            }}
                            onClick={() => {
                              copyToClipboard(
                                generatedFiles.mainPrompt,
                                'Main prompt copied to clipboard!'
                              );
                            }}
                          >
                            <Copy className='h-4 w-4' />
                          </Button>
                        </div>
                      )}

                      {activeTab === 'copilot' && (
                        <div
                          id='copilot-prompt-panel'
                          role='tabpanel'
                          aria-labelledby='copilot-tab'
                          className='relative group h-full'
                        >
                          <Textarea
                            ref={copilotSticky.textareaRef}
                            value={generatedFiles.copilotInstructions}
                            readOnly
                            className='font-mono text-sm resize-none h-full pr-12'
                          />
                          <Button
                            size='icon'
                            variant='outline'
                            className='absolute right-2 opacity-30 group-hover:opacity-100 transition-opacity z-10'
                            style={{
                              top: `${Math.max(
                                8,
                                copilotSticky.scrollTop + 8
                              )}px`,
                            }}
                            onClick={() => {
                              copyToClipboard(
                                generatedFiles.copilotInstructions,
                                selectedAiTool === 'cursor'
                                  ? 'Cursor rules copied to clipboard!'
                                  : 'Copilot instructions copied to clipboard!'
                              );
                            }}
                          >
                            <Copy className='h-4 w-4' />
                          </Button>
                        </div>
                      )}

                      {activeTab === 'workspace' &&
                        generatedFiles.workspaceInstructions && (
                          <div
                            id='workspace-prompt-panel'
                            role='tabpanel'
                            aria-labelledby='workspace-tab'
                            className='relative group h-full'
                          >
                            <Textarea
                              ref={workspaceSticky.textareaRef}
                              value={generatedFiles.workspaceInstructions}
                              readOnly
                              className='font-mono text-sm resize-none h-full pr-12'
                            />
                            <Button
                              size='icon'
                              variant='outline'
                              className='absolute right-2 opacity-30 group-hover:opacity-100 transition-opacity z-10'
                              style={{
                                top: `${Math.max(
                                  8,
                                  workspaceSticky.scrollTop + 8
                                )}px`,
                              }}
                              onClick={() => {
                                copyToClipboard(
                                  generatedFiles.workspaceInstructions,
                                  selectedAiTool === 'cursor'
                                    ? 'Code generation rules copied to clipboard!'
                                    : 'Workspace instructions copied to clipboard!'
                                );
                              }}
                            >
                              <Copy className='h-4 w-4' />
                            </Button>
                          </div>
                        )}
                    </section>
                  </>
                ) : (
                  <section className='relative group flex-1 min-h-[0]'>
                    <Textarea
                      ref={generatedPromptSticky.textareaRef}
                      value={generatedPrompt}
                      readOnly
                      className='font-mono text-sm resize-none h-full w-full pr-12'
                    />
                    <Button
                      size='icon'
                      variant='outline'
                      className='absolute right-2 opacity-30 group-hover:opacity-100 transition-opacity z-10'
                      style={{
                        top: `${Math.max(
                          8,
                          generatedPromptSticky.scrollTop + 8
                        )}px`,
                      }}
                      onClick={() => {
                        copyToClipboard(
                          generatedPrompt,
                          'Prompt copied to clipboard!'
                        );
                      }}
                    >
                      <Copy className='h-4 w-4' />
                    </Button>
                  </section>
                )}

                <div className='flex gap-3 pt-4'>
                  <Button
                    onClick={() => setCurrentStep(1)}
                    variant='outline'
                    className='flex-1'
                  >
                    <ArrowLeft className='w-4 h-4 mr-2' />
                    Back to Configuration
                  </Button>
                  <Button
                    onClick={() => generatePrompt('enhance')}
                    disabled={isLoading}
                    className='flex-1'
                  >
                    {isLoading ? (
                      <>
                        <div className='animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2' />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className='h-4 w-4 mr-2' />
                        Enhance Prompt
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}{' '}
        </Card>
      </main>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Data</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all data? This will remove your
              current session and saved data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={handleClearCancel}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleClearConfirm}>
              Clear All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
