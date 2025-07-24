import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Users, Star } from '@phosphor-icons/react';
import { ebookTemplates, createProjectFromTemplate, EbookTemplate } from '@/lib/templates';
import { EbookProject } from '@/lib/types';

interface TemplateGalleryProps {
  onSelectTemplate: (project: EbookProject) => void;
  onClose: () => void;
}

export function TemplateGallery({ onSelectTemplate, onClose }: TemplateGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EbookTemplate | null>(null);
  const [customTitle, setCustomTitle] = useState('');

  const handleTemplateSelect = (template: EbookTemplate) => {
    setSelectedTemplate(template);
    setCustomTitle(template.name);
  };

  const handleCreateFromTemplate = () => {
    if (!selectedTemplate) return;
    
    const project = createProjectFromTemplate(selectedTemplate, customTitle);
    onSelectTemplate(project);
    onClose();
  };

  const categories = [...new Set(ebookTemplates.map(t => t.category))];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl max-h-[90vh] bg-background rounded-3xl neomorph-raised overflow-hidden"
      >
        <div className="p-8 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl neomorph-flat">
                <Star size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Choose Your Template</h2>
                <p className="text-muted-foreground">Start with professionally crafted content structures</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="neomorph-button border-0"
            >
              ✕
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Template List */}
          <div className="w-2/3 p-6 overflow-y-auto">
            <div className="space-y-6">
              {categories.map(category => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-4 text-primary">{category}</h3>
                  <div className="grid gap-4">
                    {ebookTemplates
                      .filter(template => template.category === category)
                      .map(template => (
                        <motion.div
                          key={template.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className={`cursor-pointer transition-all neomorph-button border-0 ${
                              selectedTemplate?.id === template.id 
                                ? 'ring-2 ring-primary shadow-inner' 
                                : ''
                            }`}
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{template.icon}</span>
                                  <div>
                                    <CardTitle className="text-lg">{template.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {template.description}
                                    </p>
                                  </div>
                                </div>
                                <Badge 
                                  variant="secondary"
                                  className="neomorph-flat border-0"
                                >
                                  {template.chapters.length} chapters
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock size={16} />
                                  <span>{template.estimatedReadTime}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users size={16} />
                                  <span>{template.targetAudience}</span>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {template.chapters.slice(0, 3).map((chapter, index) => (
                                  <Badge 
                                    key={index}
                                    variant="outline"
                                    className="text-xs neomorph-flat border-0"
                                  >
                                    {chapter.title}
                                  </Badge>
                                ))}
                                {template.chapters.length > 3 && (
                                  <Badge 
                                    variant="outline"
                                    className="text-xs neomorph-flat border-0"
                                  >
                                    +{template.chapters.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Template Preview */}
          <div className="w-1/3 border-l border-border/50 p-6 bg-muted/20">
            {selectedTemplate ? (
              <motion.div
                key={selectedTemplate.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{selectedTemplate.icon}</div>
                  <h3 className="text-xl font-bold">{selectedTemplate.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedTemplate.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Brand Colors</h4>
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg neomorph-flat"
                        style={{ backgroundColor: selectedTemplate.brandConfig.primaryColor }}
                      />
                      <div 
                        className="w-8 h-8 rounded-lg neomorph-flat"
                        style={{ backgroundColor: selectedTemplate.brandConfig.secondaryColor }}
                      />
                      <div 
                        className="w-8 h-8 rounded-lg neomorph-flat"
                        style={{ backgroundColor: selectedTemplate.brandConfig.accentColor }}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Chapter Overview</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedTemplate.chapters.map((chapter, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 text-sm p-2 rounded-lg neomorph-flat"
                        >
                          <span className="text-primary font-medium">{index + 1}.</span>
                          <span>{chapter.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Customize Title</h4>
                    <Input
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Enter your ebook title..."
                      className="neomorph-inset border-0"
                    />
                  </div>

                  <Button
                    onClick={handleCreateFromTemplate}
                    disabled={!customTitle.trim()}
                    className="w-full gap-2 neomorph-button border-0"
                    size="lg"
                  >
                    <BookOpen size={20} />
                    Create from Template
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <BookOpen size={48} className="mb-4 opacity-50" />
                <p>Select a template to see preview and customization options</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}