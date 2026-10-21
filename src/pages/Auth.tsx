import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { validatePasswordSecurity } from '@/lib/hibp';
import { useSignupGating } from '@/hooks/useSignupGating';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useLanguage } from '@/hooks/useLanguage';

// Input validation schema
const authSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .trim(),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password must be less than 128 characters'),
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional()
});

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp, bypassAuth } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { isEmailAllowed, getSignupError, loading: gatingLoading } = useSignupGating();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Redirect if already authenticated - check role to determine destination
  if (user && !roleLoading) {
    return <Navigate to={isAdmin ? "/admin" : "/tenant"} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input using zod schema
      const validationData = {
        email: email.trim(),
        password,
        ...(isSignUp && { fullName: fullName.trim() })
      };

      const validationResult = authSchema.safeParse(validationData);
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: t('auth.validationError'),
          description: firstError.message,
          variant: "destructive"
        });
        return;
      }

      // For sign up, check gating and validate password security first
      if (isSignUp) {
        const signupError = getSignupError(email);
        if (signupError) {
          toast({
            title: t('auth.signupRestricted'),
            description: signupError,
            variant: "destructive"
          });
          return;
        }

        const isPasswordSecure = await validatePasswordSecurity(password);
        if (!isPasswordSecure) {
          return; // Validation failed, error already shown to user
        }
      }

      if (isSignUp) {
        await signUp(validationResult.data.email, validationResult.data.password, validationResult.data.fullName);
      } else {
        await signIn(validationResult.data.email, validationResult.data.password);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (gatingLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-sea flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if signup is blocked for this email
  const signupError = isSignUp ? getSignupError(email) : null;

  return (
    <div className="min-h-screen bg-gradient-sea flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('auth.title')}
          </h1>
          <p className="text-primary-foreground/80">
            {t('auth.tagline')}
          </p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isSignUp ? t('auth.createAccountTitle') : t('auth.welcomeBackTitle')}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp 
                ? t('auth.signUpDescription')
                : t('auth.signInDescription')
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Signup restriction notice */}
            {isSignUp && signupError && (
              <Alert className="mb-4 border-yellow-200 bg-yellow-50 text-yellow-800">
                <AlertDescription>{signupError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={t('auth.enterFullName')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    maxLength={100}
                    required
                    aria-label={t('auth.fullName')}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.enterEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  required
                  aria-label={t('auth.email')}
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.enterPassword')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={12}
                  maxLength={128}
                  required
                  aria-label={t('auth.password')}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
                {isSignUp && (
                  <p className="text-xs text-muted-foreground">
                    {t('auth.passwordRequirement')}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-lighthouse text-primary-foreground hover:opacity-90"
                disabled={loading || (isSignUp && !!signupError)}
              >
                {loading 
                  ? (isSignUp ? t('auth.creatingAccount') : t('auth.signingIn'))
                  : (isSignUp ? t('auth.createAccountTitle') : t('auth.signIn'))
                }
              </Button>
            </form>

            <Separator className="my-6" />

            {/* Temporary Bypass Section */}
            <div className="text-center space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  {t('auth.devAccessTitle')}
                </h3>
                <p className="text-xs text-red-600 mb-3">
                  {t('auth.devAccessWarning')}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      bypassAuth('tenant');
                    }}
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-100"
                  >
                    {t('auth.accessTenantPortal')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      bypassAuth('admin');
                    }}
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-100"
                  >
                    {t('auth.accessAdminPortal')}
                  </Button>
                </div>
              </div>
              
              <Button
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={loading}
              >
                {isSignUp 
                  ? t('auth.alreadyHaveAccount')
                  : t('auth.noAccount')
                }
              </Button>
            </div>

            <div className="text-center mt-4">
              <Link 
                to="/" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t('auth.backToHomepage')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;