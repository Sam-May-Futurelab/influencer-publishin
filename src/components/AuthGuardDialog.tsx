import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  GoogleLogo, 
  EnvelopeSimple,
  BookOpen,
  Crown,
  Sparkle
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface AuthGuardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
  action?: string;
}

export function AuthGuardDialog({ 
  isOpen, 
  onClose, 
  onSignIn,
  action = "create an eBook"
}: AuthGuardDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md neomorph-raised border-0">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center neomorph-raised"
          >
            <User size={32} className="text-primary" />
          </motion.div>
          
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Sign In Required
          </DialogTitle>
          
          <DialogDescription className="text-gray-600 mt-2">
            You need to be signed in to {action}. Join Inkfluence AI to unlock the power of AI-assisted writing!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Features Preview */}
          <Card className="neomorph-flat border-0">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3 text-gray-900">What you'll get:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen size={16} className="text-blue-600" />
                  <span>4 free pages to start your eBook</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkle size={16} className="text-purple-600" />
                  <span>AI-powered content assistance</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Crown size={16} className="text-yellow-600" />
                  <span>Premium templates & export options</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sign In Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => {
                onSignIn();
                onClose();
              }}
              className="w-full gap-3 h-12 neomorph-button border-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
            >
              <GoogleLogo size={20} />
              Sign In with Google
            </Button>
          </motion.div>

          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white px-3 text-xs text-gray-500">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              onSignIn();
              onClose();
            }}
            className="w-full gap-3 h-12 neomorph-button border-0"
          >
            <EnvelopeSimple size={20} />
            Sign In with Email
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy. 
            Start creating amazing eBooks today!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
