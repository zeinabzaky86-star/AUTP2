import { useState } from 'react';
import { QrCode, Shield, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAdminMFA } from '@/hooks/useAdminMFA';
import { useToast } from '@/hooks/use-toast';

interface AdminMFASetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminMFASetup = ({ open, onOpenChange }: AdminMFASetupProps) => {
  const { isMFAEnabled, loading, totpSecret, enrollMFA, verifyMFA, unenrollMFA } = useAdminMFA();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'status' | 'setup' | 'verify'>('status');

  const handleEnrollMFA = async () => {
    try {
      const data = await enrollMFA();
      setFactorId(data.id);
      setStep('verify');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleVerifyMFA = async () => {
    if (!verificationCode || !factorId) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter the verification code."
      });
      return;
    }

    try {
      await verifyMFA(verificationCode, factorId);
      setStep('status');
      setVerificationCode('');
      setFactorId('');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleUnenrollMFA = async () => {
    try {
      await unenrollMFA();
      setStep('status');
    } catch (error) {
      // Error handled in hook
    }
  };

  const copySecret = async () => {
    if (totpSecret?.secret) {
      await navigator.clipboard.writeText(totpSecret.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Secret key copied to clipboard"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Two-Factor Authentication</span>
          </DialogTitle>
        </DialogHeader>

        {step === 'status' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">MFA Status</CardTitle>
                <CardDescription>
                  Current two-factor authentication status for your admin account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className={`h-4 w-4 ${isMFAEnabled ? 'text-green-600' : 'text-yellow-600'}`} />
                    <span className="text-sm">
                      MFA is {isMFAEnabled ? 'enabled' : 'disabled'}
                    </span>
                  </div>
                  <Badge variant={isMFAEnabled ? 'default' : 'secondary'}>
                    {isMFAEnabled ? 'Secure' : 'Setup Required'}
                  </Badge>
                </div>
                
                <div className="mt-4 space-y-2">
                  {isMFAEnabled ? (
                    <Button 
                      variant="outline" 
                      onClick={handleUnenrollMFA}
                      disabled={loading}
                      className="w-full"
                    >
                      Disable MFA
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setStep('setup')}
                      disabled={loading}
                      className="w-full"
                    >
                      Set Up MFA
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Set Up Authenticator App</CardTitle>
                <CardDescription>
                  Use an authenticator app like Google Authenticator, Authy, or 1Password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Button 
                    onClick={handleEnrollMFA}
                    disabled={loading}
                    className="w-full"
                  >
                    Generate QR Code
                  </Button>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setStep('status')} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'verify' && totpSecret && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Scan QR Code</CardTitle>
                <CardDescription>
                  Scan this QR code with your authenticator app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {totpSecret.qr_code && (
                  <div className="flex justify-center">
                    <div 
                      className="bg-white p-4 rounded-lg"
                      dangerouslySetInnerHTML={{ __html: totpSecret.qr_code }}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="text-xs">Manual Entry Secret</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={totpSecret.secret} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copySecret}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verification-code">Enter Verification Code</Label>
                  <Input
                    id="verification-code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center font-mono text-lg"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('setup')} 
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleVerifyMFA}
                    disabled={loading || verificationCode.length !== 6}
                    className="flex-1"
                  >
                    Verify & Enable
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};