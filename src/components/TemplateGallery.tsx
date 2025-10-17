import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Users, Star, MagnifyingGlass, GridFour, ListBullets, Eye } from '@phosphor-icons/react';
import { ebookTemplates, createProjectFromTemplate, EbookTemplate } from '@/lib/templates';
import { EbookProject } from '@/lib/types';
import { PreviewDialog } from '@/components/PreviewDialog';

interface TemplateGalleryProps {
  onSelectTemplate: (project: EbookProject) => void;
  onClose: () => void;
}

export function TemplateGallery({ onSelectTemplate, onClose }: TemplateGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EbookTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EbookTemplate | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleTemplateSelect = (template: EbookTemplate) => {
    // If clicking the same template, deselect it
    if (selectedTemplate?.id === template.id) {
      setSelectedTemplate(null);
      setCustomTitle('');
    } else {
      setSelectedTemplate(template);
      setCustomTitle(template.name);
    }
  };

  const handleCreateFromTemplate = () => {
    if (!selectedTemplate) return;
    
    const project = createProjectFromTemplate(selectedTemplate, customTitle);
    onSelectTemplate(project);
    onClose();
  };

  const categories = [...new Set(ebookTemplates.map(t => t.category))];
  
  const filteredTemplates = ebookTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-2xl lg:text-4xl font-bold">Choose a Template</h1>
        <p className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto">
          Start with a professionally designed template to accelerate your ebook creation process.
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between"
      >
        {/* Search */}
        <div className="relative flex-1 lg:max-w-md">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 neomorph-inset border-0 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex rounded-lg neomorph-inset p-1 overflow-x-auto">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="h-8 px-3 text-xs whitespace-nowrap"
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="h-8 px-3 text-xs whitespace-nowrap capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* View Mode */}
          <div className="flex rounded-lg neomorph-inset p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-3"
            >
              <GridFour size={14} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <ListBullets size={14} />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className={`cursor-pointer border-2 transition-all duration-300 ${
                selectedTemplate?.id === template.id
                  ? 'border-primary neomorph-raised' 
                  : 'border-transparent neomorph-flat hover:neomorph-raised'
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{template.icon}</div>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-500" />
                    <span className="text-xs text-muted-foreground">4.8</span>
                  </div>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock size={10} className="mr-1" />
                    {template.estimatedReadTime}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Users size={10} className="mr-1" />
                    {template.targetAudience}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{template.chapters.length} chapters</span>
                  <span>~{template.chapters.reduce((sum, ch) => sum + (ch.content?.split(' ').length || 0), 0).toLocaleString()} words</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: template.brandConfig.primaryColor }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: template.brandConfig.secondaryColor }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: template.brandConfig.accentColor }}
                    />
                  </div>
                  
                  {/* Preview Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(template);
                    }}
                    className="h-8 px-3 text-xs gap-1.5 neomorph-button border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all"
                  >
                    <Eye size={14} weight="duotone" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <BookOpen size={64} className="mx-auto mb-6 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or category filters.
          </p>
        </motion.div>
      )}

      {/* Selected Template Details & Creation */}
      {selectedTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-4 lg:p-6 bg-background border-t border-border neomorph-raised"
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-3xl">{selectedTemplate.icon}</div>
                <div>
                  <h3 className="font-bold text-lg">{selectedTemplate.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <Input
                  placeholder="Customize title..."
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="neomorph-inset border-0 min-w-0 lg:w-64"
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setCustomTitle('');
                    }}
                    className="neomorph-button border-0"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateFromTemplate}
                    disabled={!customTitle.trim()}
                    className="neomorph-button border-0 gap-2"
                  >
                    <BookOpen size={16} />
                    Create Ebook
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Preview Dialog */}
      {previewTemplate && (
        <PreviewDialog
          project={createProjectFromTemplate(previewTemplate, previewTemplate.name)}
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}