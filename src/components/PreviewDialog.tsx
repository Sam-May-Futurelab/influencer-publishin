import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, X } from '@phosphor-icons/react';
import { EbookProject } from '@/lib/types';
import { motion } from 'framer-motion';

interface PreviewDialogProps {
  project: EbookProject;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewDialog({ project, isOpen, onClose }: PreviewDialogProps) {
  const getWordCount = () => {
    return project.chapters.reduce((total, chapter) => {
      if (!chapter.content) return total;
      
      // Strip HTML tags for accurate word count
      const textContent = chapter.content.replace(/<[^>]*>/g, ' ');
      const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
      
      return total + wordCount;
    }, 0);
  };

  const formatContent = (content: string) => {
    if (!content) return <p className="text-muted-foreground italic">No content yet...</p>;
    
    // Check if content is markdown (contains markdown syntax)
    const isMarkdown = content.includes('**') || content.includes('##') || content.includes('- ') || content.includes('# ');
    
    if (isMarkdown) {
      // Convert markdown to HTML (same logic as export.ts)
      let html = content;
      
      // Headers
      html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
      html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
      html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
      
      // Bold
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      
      // Italic
      html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
      
      // Links
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
      
      // Unordered lists (bullet points)
      html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
      html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
      // Fix nested ul tags
      html = html.replace(/<\/ul>\s*<ul>/g, '');
      
      // Ordered lists (numbered)
      html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
      
      // Checkboxes
      html = html.replace(/- \[ \] (.+)/g, '<li>☐ $1</li>');
      html = html.replace(/- \[x\] (.+)/gi, '<li>☑ $1</li>');
      
      // Paragraphs (lines separated by blank lines)
      html = html.replace(/\n\n/g, '</p><p>');
      html = html.replace(/^(?!<[hul])/gm, '<p>');
      html = html.replace(/(?<![>])$/gm, '</p>');
      
      // Clean up extra p tags around headers and lists
      html = html.replace(/<p>(<h[1-6]>)/g, '$1');
      html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
      html = html.replace(/<p>(<ul>)/g, '$1');
      html = html.replace(/(<\/ul>)<\/p>/g, '$1');
      html = html.replace(/<p>(<ol>)/g, '$1');
      html = html.replace(/(<\/ol>)<\/p>/g, '$1');
      html = html.replace(/<p><\/p>/g, '');
      
      return <div dangerouslySetInnerHTML={{ __html: html }} />;
    }
    
    // Content is already HTML from the rich text editor
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  const sortedChapters = [...project.chapters].sort((a, b) => a.order - b.order);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] neomorph-raised border-0 p-0 gap-0 [&>button]:hidden">
        <DialogHeader className="p-4 lg:p-6 border-b border-border/20 relative">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl neomorph-inset">
              <BookOpen size={20} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg lg:text-xl font-bold">
                {project.title} - Preview
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {sortedChapters.length} chapters • {getWordCount().toLocaleString()} words
              </DialogDescription>
            </div>
          </div>
          
          {/* Custom styled close button */}
          <motion.div 
            className="absolute top-4 right-4 lg:top-6 lg:right-6"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="neomorph-button border-0 h-10 w-10 p-0 rounded-full bg-background/80 backdrop-blur-sm hover:bg-primary/10 transition-all duration-200 shadow-lg"
            >
              <X size={18} className="text-muted-foreground hover:text-primary transition-colors" />
            </Button>
          </motion.div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 max-h-[calc(80vh-120px)]">
          <div className="max-w-3xl mx-auto">
            {/* Title Page - Show custom cover if available, otherwise use default */}
            {project.coverDesign?.coverImageData ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 rounded-2xl overflow-hidden shadow-2xl mx-auto"
                style={{ maxWidth: '500px' }}
              >
                <img 
                  src={project.coverDesign.coverImageData} 
                  alt={`${project.title} cover`}
                  className="w-full h-auto"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 mb-12 border-b-4 border-border/30"
                style={{ borderColor: project.brandConfig?.accentColor || '#C4B5FD' }}
              >
              {/* Logo if available */}
              {project.brandConfig?.logoUrl && (
                <div className="mb-6">
                  <img 
                    src={project.brandConfig.logoUrl} 
                    alt="Logo" 
                    className="h-16 mx-auto object-contain"
                  />
                </div>
              )}
              
              <h1 
                className="text-3xl lg:text-4xl font-bold mb-6 leading-tight px-4"
                style={{ 
                  color: project.brandConfig?.primaryColor || '#8B5CF6',
                  fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif',
                  wordBreak: 'break-word',
                  hyphens: 'auto'
                }}
              >
                {project.title}
              </h1>
              
              {project.author && (
                <p 
                  className="text-xl mb-6 italic"
                  style={{ 
                    color: project.brandConfig?.secondaryColor || '#A78BFA',
                    fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif'
                  }}
                >
                  by {project.author}
                </p>
              )}
              
              {project.description && (
                <p 
                  className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8"
                  style={{ fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif' }}
                >
                  {project.description}
                </p>
              )}
              
              <div className="flex justify-center gap-4 mt-8 text-sm font-medium">
                <span 
                  style={{ 
                    color: project.brandConfig?.primaryColor || '#8B5CF6',
                    fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif'
                  }}
                >
                  {sortedChapters.length} Chapter{sortedChapters.length !== 1 ? 's' : ''}
                </span>
                <span className="text-muted-foreground">•</span>
                <span 
                  style={{ 
                    color: project.brandConfig?.primaryColor || '#8B5CF6',
                    fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif'
                  }}
                >
                  {getWordCount().toLocaleString()} Words
                </span>
                <span className="text-muted-foreground">•</span>
                <span 
                  style={{ 
                    color: project.brandConfig?.primaryColor || '#8B5CF6',
                    fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif'
                  }}
                >
                  ~{Math.ceil(getWordCount() / 250)} Pages
                </span>
              </div>
            </motion.div>
            )}

            {/* Copyright Page */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="py-12 mb-12 border-b-2 border-border/20"
              style={{ fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif' }}
            >
              <div className="max-w-xl mx-auto space-y-6 text-sm text-muted-foreground">
                <p className="font-semibold text-base text-foreground">{project.title}</p>
                {project.author && (
                  <p className="text-foreground">by {project.author}</p>
                )}
                
                <div className="space-y-2">
                  <p>Copyright © {new Date().getFullYear()} {project.author || 'Author'}</p>
                  <p>All rights reserved.</p>
                </div>
                
                <p className="leading-relaxed">
                  No part of this book may be reproduced in any form or by any electronic or mechanical means, 
                  including information storage and retrieval systems, without written permission from the author, 
                  except for the use of brief quotations in a book review.
                </p>
                
                <div className="pt-4 border-t border-border/20 text-xs space-y-1">
                  <p><strong>First Edition:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  <p>Created with Inkfluence AI</p>
                </div>
              </div>
            </motion.div>

            {/* Table of Contents */}
            {sortedChapters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="py-12 mb-12"
                style={{ fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif' }}
              >
                <h2 
                  className="text-3xl font-bold mb-8 pb-4 text-center"
                  style={{ 
                    color: project.brandConfig?.primaryColor || '#8B5CF6',
                    borderBottom: `3px solid ${project.brandConfig?.accentColor || '#C4B5FD'}`
                  }}
                >
                  Table of Contents
                </h2>
                <div className="space-y-3">
                  {sortedChapters.map((chapter, index) => (
                    <div 
                      key={chapter.id}
                      className="flex items-baseline justify-between py-2 px-4 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer border-b border-dotted border-border/30"
                      onClick={() => {
                        const element = document.getElementById(`chapter-${chapter.id}`);
                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      <div className="flex items-baseline gap-3 flex-1">
                        <span 
                          className="text-sm font-semibold"
                          style={{ color: project.brandConfig?.secondaryColor || '#A78BFA' }}
                        >
                          Chapter {index + 1}
                        </span>
                        <span 
                          className="font-medium text-foreground"
                          style={{ flex: 1 }}
                        >
                          {chapter.title}
                        </span>
                      </div>
                      <span 
                        className="text-sm font-semibold ml-4"
                        style={{ color: project.brandConfig?.primaryColor || '#8B5CF6' }}
                      >
                        {index + 2}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Chapters - Enhanced with export-like styling */}
            <div className="space-y-12 mt-8">
              {sortedChapters.map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  id={`chapter-${chapter.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-6 pb-8 scroll-mt-24"
                  style={{ 
                    borderBottom: index < sortedChapters.length - 1 ? `2px solid ${project.brandConfig?.accentColor || '#E9D5FF'}` : 'none',
                    fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif'
                  }}
                >
                  {/* Chapter Number */}
                  <div 
                    className="text-sm font-semibold tracking-wider uppercase mb-2"
                    style={{ color: project.brandConfig?.secondaryColor || '#A78BFA' }}
                  >
                    Chapter {index + 1}
                  </div>
                  
                  {/* Chapter Title with bottom border */}
                  <h2 
                    className="text-2xl lg:text-3xl font-bold pb-4"
                    style={{ 
                      color: project.brandConfig?.primaryColor || '#8B5CF6',
                      borderBottom: `3px solid ${project.brandConfig?.accentColor || '#C4B5FD'}`,
                      fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif'
                    }}
                  >
                    {chapter.title}
                  </h2>
                  
                  {/* Chapter Content with drop cap styling - matching export.ts */}
                  <div 
                    className="text-foreground/90 chapter-content-preview"
                    style={{ 
                      fontFamily: project.brandConfig?.fontFamily || 'Inter, sans-serif',
                      fontSize: '1.15em',
                      lineHeight: '1.9',
                      textAlign: 'justify',
                      color: '#374151',
                      hyphens: 'auto',
                      wordSpacing: '0.05em'
                    }}
                  >
                    {chapter.content ? (
                      <div>
                        <style>{`
                          .chapter-content-preview p {
                            margin-bottom: 1.5em;
                            text-indent: 1.5em;
                          }
                          .chapter-content-preview p:first-of-type,
                          .chapter-content-preview p:first-child {
                            text-indent: 0;
                          }
                          .chapter-content-preview p:first-child::first-letter {
                            font-size: 3.5em;
                            font-weight: 700;
                            color: ${project.brandConfig?.primaryColor || '#8B5CF6'};
                            float: left;
                            line-height: 0.9;
                            margin-right: 0.1em;
                            margin-top: 0.1em;
                          }
                          .chapter-content-preview h1,
                          .chapter-content-preview h2,
                          .chapter-content-preview h3 {
                            color: ${project.brandConfig?.primaryColor || '#8B5CF6'};
                            margin-top: 1.5em;
                            margin-bottom: 0.8em;
                            text-indent: 0;
                          }
                          .chapter-content-preview ul,
                          .chapter-content-preview ol {
                            margin-bottom: 1.5em;
                            padding-left: 2em;
                          }
                          .chapter-content-preview li {
                            margin-bottom: 0.5em;
                          }
                          .chapter-content-preview strong {
                            font-weight: 600;
                            color: ${project.brandConfig?.primaryColor || '#8B5CF6'};
                          }
                          .chapter-content-preview a {
                            color: ${project.brandConfig?.primaryColor || '#8B5CF6'};
                            text-decoration: underline;
                          }
                        `}</style>
                        {formatContent(chapter.content)}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">
                        This chapter has no content yet.
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {sortedChapters.length === 0 && (
              <div className="text-center py-12">
                <BookOpen size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Chapters Yet</h3>
                <p className="text-muted-foreground">
                  Create your first chapter to see the preview.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
