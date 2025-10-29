import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  User, 
  Crown, 
  CreditCard, 
  Shield, 
  Bell,
  Download,
  Trash,
  Check,
  X,
  BookOpen,
  Palette,
  ChartBar,
  FileText,
  Gear
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { deleteUserAccount } from '@/lib/auth';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { usePayments } from '@/hooks/use-payments';

interface ProfilePageProps {
  onNavigate?: (section: string) => void;
}

// Settings interface
interface AppSettings {
  // Author Profile (used in exports)
  authorName: string;
  authorBio: string;
  authorWebsite: string;
  
  // Publishing Preferences
  autoSaveInterval: number;
  defaultExportFormat: 'pdf' | 'epub' | 'docx';
  customWatermark: string; // Premium only
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, userProfile, updateUserProfile, signOut, refreshProfile } = useAuth();
  const { purchaseSubscription, purchasing, canPurchase, loading: paymentsLoading } = usePayments();
  const [projects] = useLocalStorage('ebook-projects', []);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  
  // App Settings State
  const [settings, setSettings] = useState<AppSettings>({
    // Author Profile
    authorName: '',
    authorBio: '',
    authorWebsite: '',
    
    // Publishing Preferences
    autoSaveInterval: 5,
    defaultExportFormat: 'pdf',
    customWatermark: '',
  });

  const [hasSettingsChanges, setHasSettingsChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ebookCrafterSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all fields exist
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasSettingsChanges(true);
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('ebookCrafterSettings', JSON.stringify(settings));
    setHasSettingsChanges(false);
    
    // Show success toast
    toast.success('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    if (confirm('Reset all settings to default? This cannot be undone.')) {
      localStorage.removeItem('ebookCrafterSettings');
      // Reset to defaults
      const defaultSettings: AppSettings = {
        authorName: '',
        authorBio: '',
        authorWebsite: '',
        autoSaveInterval: 5,
        defaultExportFormat: 'pdf',
        customWatermark: '',
      };
      setSettings(defaultSettings);
      setHasSettingsChanges(false);
      toast.success('Settings reset to defaults');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile({ displayName });
      await refreshProfile(); // Refresh the profile to get updated data
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleExportData = () => {
    try {
      const exportData = {
        user: {
          displayName: user?.displayName,
          email: user?.email,
          createdAt: user?.metadata?.creationTime
        },
        userProfile: userProfile,
        projects: projects,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `inkfluenceai-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Check if Google user
      const isGoogleUser = user?.providerData.some(
        provider => provider.providerId === 'google.com'
      );

      let password;
      if (!isGoogleUser) {
        password = prompt('Enter your password to confirm deletion:');
        if (!password) {
          toast.error('Password required to delete account');
          return;
        }
      } else {
        // Warn Google users about the popup
        toast.info('You will need to confirm with Google to complete deletion', { duration: 3000 });
      }

      // Delete Firestore data via backend
      const response = await fetch('/api/delete-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid, confirmationText: 'DELETE MY DATA' }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user data');
      }

      toast.success('Data deleted. Confirming with Google...');

      // Re-authenticate & delete Firebase Auth account
      // For Google users, this will show a popup to re-confirm with Google
      if (user) {
        await deleteUserAccount(user, password);
      }

      toast.success('Account deleted successfully');
      onNavigate?.('dashboard');
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      toast.error(error?.message || 'Failed to delete account');
    }
  };

  const handleUpgrade = async (tier: 'creator' | 'premium') => {
    if (!canPurchase) {
      if (paymentsLoading) {
        toast.info('Payment system is loading. Please wait...');
      } else if (userProfile?.isPremium) {
        toast.info('You already have Premium!');
      } else {
        toast.error('Payment system not available. Please try again later.');
      }
      return;
    }

    // Construct the plan ID based on tier and billing interval
    const planId = `${tier}-${billingInterval}` as 'creator-monthly' | 'creator-yearly' | 'premium-monthly' | 'premium-yearly';
    
    const success = await purchaseSubscription(planId);
    if (success) {
      // Success message is already shown by the hook
    }
  };

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      tagline: 'Perfect for getting started',
      price: '£0',
      period: 'forever',
      features: [
        '4 pages total',
        '3 AI generations per day',
        '3 basic templates',
        'PDF export only',
        'Basic cover designer',
        '1 AI cover per month',
        'Cloud storage',
        'Email support'
      ],
      current: !userProfile?.isPremium && userProfile?.subscriptionStatus === 'free',
      popular: false,
      ctaText: 'Current Plan',
      ctaDisabled: true
    },
    {
      id: 'creator',
      name: 'Creator',
      tagline: 'For growing authors',
      price: '£4.99',
      period: 'per month',
      yearlyPrice: '£49/year',
      savings: 'Save 17%',
      features: [
        '20 pages total',
        '15 AI generations per day',
        '10 premium templates',
        'PDF & EPUB export',
        'Advanced cover designer',
        '10 AI covers per month',
        'Custom watermarks',
        'Cloud storage',
        'Email support'
      ],
      current: userProfile?.subscriptionStatus === 'creator',
      popular: false,
      ctaText: userProfile?.subscriptionStatus === 'creator' ? 'Current Plan' : 'Upgrade to Creator',
      ctaDisabled: userProfile?.subscriptionStatus === 'creator'
    },
    {
      id: 'premium',
      name: 'Premium',
      tagline: 'For professional authors',
      price: '£9.99',
      period: 'per month',
      yearlyPrice: '£99/year',
      savings: 'Save 17%',
      features: [
        'Unlimited pages',
        '50 AI generations per day',
        '20+ premium templates',
        'All export formats (PDF, EPUB, DOCX)',
        'Advanced cover designer',
        '50 AI covers per month',
        'Custom branding & watermarks',
        'Priority support',
        'Writing analytics',
        'Batch operations',
        'Advanced AI features',
        'Commercial license'
      ],
      current: userProfile?.isPremium,
      popular: true,
      ctaText: userProfile?.isPremium ? 'Current Plan' : 'Upgrade to Premium',
      ctaDisabled: userProfile?.isPremium
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your account, subscription, and preferences</p>
        </motion.div>

        {/* Profile Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="neomorph-raised border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg neomorph-flat">
                  <User size={20} className="text-primary" />
                </div>
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {user?.displayName || user?.email?.split('@')[0] || 'User'}
                    </h3>
                    {userProfile?.isPremium && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                        <Crown size={12} className="mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since {user?.metadata?.creationTime ? 
                      new Date(user.metadata.creationTime).toLocaleDateString() : 
                      'Recently'
                    }
                  </p>
                </div>
              </div>

              <Separator />

              {/* Name Editing */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="displayName" className="text-sm font-medium">
                    Display Name
                  </Label>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="neomorph-button border-0"
                    >
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDisplayName(user?.displayName || '');
                          setIsEditing(false);
                        }}
                        className="neomorph-button border-0"
                      >
                        <X size={14} />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        className="neomorph-button border-0"
                      >
                        <Check size={14} />
                      </Button>
                    </div>
                  )}
                </div>
                
                {isEditing ? (
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="neomorph-inset border-0"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-lg neomorph-inset">
                    {user?.displayName || 'No display name set'}
                  </div>
                )}
              </div>

              {/* Account Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg neomorph-flat">
                  <div className="text-2xl font-bold text-primary">
                    {userProfile?.pagesUsed || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Pages Created</div>
                </div>
                <div className="text-center p-4 rounded-lg neomorph-flat">
                  <div className="text-2xl font-bold text-green-600">
                    {userProfile?.isPremium 
                      ? '∞' 
                      : userProfile?.subscriptionStatus === 'creator'
                      ? Math.max(0, 20 - (userProfile?.pagesUsed || 0))
                      : Math.max(0, 4 - (userProfile?.pagesUsed || 0))
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Pages Remaining</div>
                </div>
                <div className="text-center p-4 rounded-lg neomorph-flat">
                  <div className="text-2xl font-bold text-blue-600">
                    {userProfile?.isPremium 
                      ? 'Premium' 
                      : userProfile?.subscriptionStatus === 'creator'
                      ? 'Creator'
                      : 'Free'}
                  </div>
                  <div className="text-sm text-muted-foreground">Plan Status</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscription Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="neomorph-raised border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg neomorph-flat">
                  <Crown size={20} className="text-primary" />
                </div>
                Subscription Plans
              </CardTitle>
              <p className="text-sm text-gray-600">
                Choose the plan that best fits your needs
              </p>
              
              {/* Billing Interval Toggle */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <span className={`text-sm font-medium ${billingInterval === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    billingInterval === 'yearly' ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      billingInterval === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${billingInterval === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Yearly
                </span>
                {billingInterval === 'yearly' && (
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 border-green-300">
                    Save 17%
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`relative ${plan.popular ? 'md:-mt-4' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-3 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <Card className={`h-full ${plan.current ? 'ring-2 ring-primary/30' : ''} ${plan.popular ? 'neomorph-raised shadow-xl' : 'neomorph-flat'} border-0`}>
                      <CardContent className="p-6">
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{plan.tagline}</p>
                          
                          {plan.id === 'free' ? (
                            <div className="flex items-baseline justify-center gap-1 mb-2">
                              <span className="text-4xl font-bold">{plan.price}</span>
                              <span className="text-muted-foreground text-sm">/{plan.period}</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-baseline justify-center gap-1 mb-2">
                                <span className="text-4xl font-bold">
                                  {billingInterval === 'monthly' ? plan.price : plan.yearlyPrice?.split('/')[0]}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                  /{billingInterval === 'monthly' ? 'month' : 'year'}
                                </span>
                              </div>
                              {billingInterval === 'yearly' && (
                                <div className="text-sm text-muted-foreground">
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    {plan.savings}
                                  </Badge>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        <div className="space-y-2.5 mb-6 text-left">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" weight="bold" />
                              <span className="leading-tight">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <Button
                          className={`w-full ${plan.current ? 'bg-muted text-muted-foreground cursor-default' : plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white' : 'neomorph-button border-0'}`}
                          disabled={plan.ctaDisabled || purchasing}
                          onClick={() => {
                            if (!plan.ctaDisabled) {
                              if (plan.id === 'creator') {
                                handleUpgrade('creator');
                              } else if (plan.id === 'premium') {
                                handleUpgrade('premium');
                              }
                            }
                          }}
                        >
                          {plan.current ? (
                            <>
                              <Check size={16} className="mr-2" />
                              {plan.ctaText}
                            </>
                          ) : purchasing ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="mr-2"
                              >
                                <CreditCard size={16} />
                              </motion.div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard size={16} className="mr-2" />
                              Upgrade Now
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="neomorph-raised border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg neomorph-flat">
                  <Bell size={20} className="text-primary" />
                </div>
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="text-sm font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-gray-600">
                    Receive updates about your eBooks and new features
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications" className="text-sm font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-xs text-gray-600">
                    Get notified about AI content suggestions and writing tips
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Author Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="neomorph-raised border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg neomorph-flat">
                  <User size={20} className="text-primary" />
                </div>
                Author Profile
              </CardTitle>
              <p className="text-sm text-gray-600">
                This information will be included in your exported eBooks
              </p>
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
          transition={{ delay: 0.5 }}
        >
          <Card className="neomorph-raised border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg neomorph-flat">
                  <BookOpen size={20} className="text-primary" />
                </div>
                Publishing Preferences
              </CardTitle>
              <p className="text-sm text-gray-600">
                Customize your writing and export settings
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="autoSave">Auto-save Interval</Label>
                <Select 
                  value={(settings.autoSaveInterval || 30).toString()} 
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
                <p className="text-xs text-muted-foreground">How often to automatically save your work</p>
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
                <p className="text-xs text-muted-foreground">Your preferred format will be pre-selected when exporting</p>
              </div>
              
              {userProfile?.isPremium && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="customWatermark">Custom Watermark</Label>
                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      Premium
                    </Badge>
                  </div>
                  <Input
                    id="customWatermark"
                    placeholder="e.g., Written by Your Name • yourwebsite.com"
                    value={settings.customWatermark}
                    onChange={(e) => updateSetting('customWatermark', e.target.value)}
                    className="neomorph-inset border-0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to export without any watermark. Add your custom branding text to appear in exported documents.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Card className="neomorph-raised border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg neomorph-flat">
                  <ChartBar size={20} className="text-primary" />
                </div>
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
                  onClick={handleResetSettings}
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

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="neomorph-raised border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg neomorph-flat">
                  <Shield size={20} className="text-primary" />
                </div>
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="justify-start gap-3 h-12 neomorph-button border-0 text-black hover:text-black"
                  onClick={handleExportData}
                >
                  <Download size={20} />
                  <div className="text-left">
                    <div className="font-medium">Export Data</div>
                    <div className="text-xs text-gray-600">Download your eBooks and data</div>
                  </div>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start gap-3 h-12 neomorph-button border-0 text-red-600 hover:text-red-700"
                    >
                      <Trash size={20} />
                      <div className="text-left">
                        <div className="font-medium">Delete Account</div>
                        <div className="text-xs text-gray-600">Permanently delete your account</div>
                      </div>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers, including all your eBooks and projects.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Floating Save Button for Settings Changes */}
      {hasSettingsChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={handleSaveSettings}
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
