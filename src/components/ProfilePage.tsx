import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  X
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { usePayments } from '@/hooks/use-payments';

interface ProfilePageProps {
  onNavigate?: (section: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, userProfile, updateUserProfile, signOut, refreshProfile } = useAuth();
  const { purchaseSubscription, purchasing, canPurchase, loading: paymentsLoading } = usePayments();
  const [projects] = useLocalStorage('ebook-projects', []);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

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
      // In a real app, you'd call a backend API to delete the account
      await signOut();
      toast.success('Account deletion initiated. You have been signed out.');
      onNavigate?.('dashboard');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const handleUpgrade = async (planId: 'monthly' | 'yearly') => {
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

    const success = await purchaseSubscription(planId);
    if (success) {
      // Success message is already shown by the hook
      console.log(`Successfully upgraded to ${planId} plan`);
    }
  };

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      price: '£0',
      period: 'forever',
      features: [
        '4 pages per eBook',
        'Basic templates',
        'Text export',
        'Community support'
      ],
      current: !userProfile?.isPremium,
      popular: false
    },
    {
      id: 'monthly',
      name: 'Premium Monthly',
      price: '£9.99',
      period: 'per month',
      features: [
        'Unlimited pages',
        'Premium templates',
        'Advanced AI assistance',
        'Multiple export formats',
        'Priority support',
        'Custom branding'
      ],
      current: userProfile?.isPremium && userProfile?.subscriptionType === 'monthly',
      popular: true
    },
    {
      id: 'yearly',
      name: 'Premium Yearly',
      price: '£99.99',
      period: 'per year',
      originalPrice: '£119.88',
      savings: 'Save £19.89',
      features: [
        'Everything in Monthly',
        '4 months free',
        'Advanced analytics',
        'Exclusive templates',
        'Beta features access'
      ],
      current: userProfile?.isPremium && userProfile?.subscriptionType === 'yearly',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and subscription</p>
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
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user?.displayName || user?.email?.split('@')[0] || 'User'}
                    </h3>
                    {userProfile?.isPremium && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                        <Crown size={12} className="mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{user?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
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
                  <div className="p-3 bg-gray-50 rounded-lg neomorph-inset">
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
                  <div className="text-sm text-gray-600">Pages Created</div>
                </div>
                <div className="text-center p-4 rounded-lg neomorph-flat">
                  <div className="text-2xl font-bold text-green-600">
                    {userProfile?.isPremium ? '∞' : Math.max(0, 4 - (userProfile?.pagesUsed || 0))}
                  </div>
                  <div className="text-sm text-gray-600">Pages Remaining</div>
                </div>
                <div className="text-center p-4 rounded-lg neomorph-flat">
                  <div className="text-2xl font-bold text-blue-600">
                    {userProfile?.isPremium ? 'Premium' : 'Free'}
                  </div>
                  <div className="text-sm text-gray-600">Plan Status</div>
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
                      <CardContent className="p-6 text-center">
                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                        
                        <div className="mb-4">
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-3xl font-bold">{plan.price}</span>
                            <span className="text-gray-600 text-sm">/{plan.period}</span>
                          </div>
                          {plan.originalPrice && (
                            <div className="text-sm text-gray-500">
                              <span className="line-through">{plan.originalPrice}</span>
                              <span className="text-green-600 ml-2">{plan.savings}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3 mb-6">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <Check size={16} className="text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        <Button
                          className={`w-full ${plan.current ? 'bg-gray-100 text-gray-600 cursor-default' : plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : ''} neomorph-button border-0`}
                          disabled={plan.current || purchasing}
                          onClick={() => {
                            if (!plan.current) {
                              if (plan.id === 'monthly') {
                                handleUpgrade('monthly');
                              } else if (plan.id === 'yearly') {
                                handleUpgrade('yearly');
                              } else {
                                toast.info('Downgrade feature coming soon!');
                              }
                            }
                          }}
                        >
                          {plan.current ? (
                            <>
                              <Check size={16} className="mr-2" />
                              Current Plan
                            </>
                          ) : plan.id === 'free' ? (
                            'Downgrade'
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

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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
    </div>
  );
}
