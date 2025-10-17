import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Gear, 
  User, 
  FileText, 
  Download, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  BookOpen,
  ChartBar
} from '@phosphor-icons/react';

interface SettingsPageProps {
  onBack: () => void;
}

interface AppSettings {
  // User Profile
  authorName: string;
  authorBio: string;
  authorWebsite: string;
  
  // Publishing Preferences
  defaultWordTarget: number;
  autoSaveInterval: number;
  defaultExportFormat: 'pdf' | 'epub' | 'docx';
  includeFooter: boolean;
  
  // Notifications
  saveReminders: boolean;
  exportNotifications: boolean;
  
  // Privacy & Data
  analytics: boolean;
  crashReporting: boolean;
  
  // Interface
  compactMode: boolean;
  showWordCount: boolean;
  showReadingTime: boolean;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [settings, setSettings] = useState<AppSettings>({
    // User Profile
    authorName: '',
    authorBio: '',
    authorWebsite: '',
    
    // Publishing Preferences
    defaultWordTarget: 10000,
    autoSaveInterval: 30,
    defaultExportFormat: 'pdf',
    includeFooter: true,
    
    // Notifications
    saveReminders: true,
    exportNotifications: true,
    
    // Privacy & Data
    analytics: true,
    crashReporting: true,
    
    // Interface
    compactMode: false,
    showWordCount: true,
    showReadingTime: true,
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ebookCrafterSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('ebookCrafterSettings', JSON.stringify(settings));
    setHasChanges(false);
    
    // Show success toast
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default? This cannot be undone.')) {
      localStorage.removeItem('ebookCrafterSettings');
      // Reset to defaults
      const defaultSettings = {
        authorName: '',
        authorBio: '',
        authorWebsite: '',
        defaultWordTarget: 10000,
        autoSaveInterval: 30,
        defaultExportFormat: 'pdf' as const,
        includeFooter: true,
        saveReminders: true,
        exportNotifications: true,
        analytics: true,
        crashReporting: true,
        compactMode: false,
        showWordCount: true,
        showReadingTime: true,
      };
      setSettings(defaultSettings);
      setHasChanges(false);
      toast.success('Settings reset to defaults');
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <Gear size={28} className="text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Customize your ebook creation experience
          </p>
        </div>
        
        <Button
          onClick={onBack}
          variant="outline"
          className="neomorph-button border-0"
        >
          Back to Dashboard
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* User Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="neomorph-flat border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <User size={20} className="text-primary" />
                Author Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="authorName">Author Name</Label>
                <Input
                  id="authorName"
                  value={settings.authorName}
                  onChange={(e) => updateSetting('authorName', e.target.value)}
                  placeholder="Your name or pen name"
                  className="neomorph-inset border-0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="authorBio">Bio</Label>
                <Textarea
                  id="authorBio"
                  value={settings.authorBio}
                  onChange={(e) => updateSetting('authorBio', e.target.value)}
                  placeholder="Brief description about yourself"
                  className="neomorph-inset border-0 resize-none"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="authorWebsite">Website</Label>
                <Input
                  id="authorWebsite"
                  value={settings.authorWebsite}
                  onChange={(e) => updateSetting('authorWebsite', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="neomorph-inset border-0"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Publishing Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="neomorph-flat border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <BookOpen size={20} className="text-primary" />
                Publishing Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wordTarget">Default Word Target</Label>
                <Input
                  id="wordTarget"
                  type="number"
                  value={settings.defaultWordTarget}
                  onChange={(e) => updateSetting('defaultWordTarget', parseInt(e.target.value) || 0)}
                  className="neomorph-inset border-0"
                />
                <p className="text-xs text-muted-foreground">Target word count for new projects</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="autoSave">Auto-save Interval (seconds)</Label>
                <Select 
                  value={settings.autoSaveInterval.toString()} 
                  onValueChange={(value) => updateSetting('autoSaveInterval', parseInt(value))}
                >
                  <SelectTrigger className="neomorph-inset border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Default Export Format</Label>
                <Select 
                  value={settings.defaultExportFormat} 
                  onValueChange={(value: 'pdf' | 'epub' | 'docx') => updateSetting('defaultExportFormat', value)}
                >
                  <SelectTrigger className="neomorph-inset border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="epub">EPUB</SelectItem>
                    <SelectItem value="docx">Word Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Branding Footer</Label>
                  <p className="text-xs text-muted-foreground">Add "Created with EbookCrafter" to exports</p>
                </div>
                <Switch
                  checked={settings.includeFooter}
                  onCheckedChange={(checked) => updateSetting('includeFooter', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="neomorph-flat border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Save Reminders</Label>
                  <p className="text-xs text-muted-foreground">Remind to save work periodically</p>
                </div>
                <Switch
                  checked={settings.saveReminders}
                  onCheckedChange={(checked) => updateSetting('saveReminders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Export Notifications</Label>
                  <p className="text-xs text-muted-foreground">Notify when exports complete</p>
                </div>
                <Switch
                  checked={settings.exportNotifications}
                  onCheckedChange={(checked) => updateSetting('exportNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interface Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="neomorph-flat border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Palette size={20} className="text-primary" />
                Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-xs text-muted-foreground">Reduce spacing for more content</p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Word Count</Label>
                  <p className="text-xs text-muted-foreground">Display live word count in editor</p>
                </div>
                <Switch
                  checked={settings.showWordCount}
                  onCheckedChange={(checked) => updateSetting('showWordCount', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Reading Time</Label>
                  <p className="text-xs text-muted-foreground">Display estimated reading time</p>
                </div>
                <Switch
                  checked={settings.showReadingTime}
                  onCheckedChange={(checked) => updateSetting('showReadingTime', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy & Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="neomorph-flat border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} className="text-primary" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Usage Analytics</Label>
                  <p className="text-xs text-muted-foreground">Help improve the app with anonymous usage data</p>
                </div>
                <Switch
                  checked={settings.analytics}
                  onCheckedChange={(checked) => updateSetting('analytics', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Crash Reporting</Label>
                  <p className="text-xs text-muted-foreground">Send error reports to help fix bugs</p>
                </div>
                <Switch
                  checked={settings.crashReporting}
                  onCheckedChange={(checked) => updateSetting('crashReporting', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="neomorph-flat border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <ChartBar size={20} className="text-primary" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Version</span>
                  <Badge variant="secondary" className="neomorph-flat border-0">1.0.0</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Build</span>
                  <Badge variant="outline" className="border-0">2025.01.24</Badge>
                </div>
              </div>
              
              <div className="pt-2 border-t border-border/20">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="w-full neomorph-button border-0 text-destructive hover:text-destructive"
                >
                  Reset All Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6"
        >
          <Button
            onClick={handleSave}
            className="neomorph-button border-0 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
            size="lg"
          >
            <FileText size={18} className="mr-2" />
            Save Settings
          </Button>
        </motion.div>
      )}
    </div>
  );
}
