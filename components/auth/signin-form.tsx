'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Mail, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signIn, signUp } from '@/lib/actions/auth-actions';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export async function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSign, setIsSign] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {data: session} = await authClient.useSession()

  if (session) {
    router.push('/dashboard')
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSign) {
        // SIGN IN LOGIC
        const result = await signIn(email, password);

        if (result.success) {
          console.log("Logged in successfully:", result.data);
          router.push('/dashboard');
          router.refresh();
          toast({
            title: 'Success',
            description: "Logged in successfully",
            variant: 'success',
          })
        } else if (result.error === "EMAIL_NOT_VERIFIED") {
          console.log("Verification required. Message:", result.message);
          toast({
            title: 'Verification Required',
            description: result.message,
            variant: 'destructive',
          })
          router.push(`/verify-pending?email=${encodeURIComponent(email)}`);
        } else {
          console.error("Login failed:", result.message);
          toast({
            title: 'Error',
            description: result.message,
            variant: 'destructive',
          })
        }
      } else {
        // SIGN UP LOGIC
        const result = await signUp(name, email, password);

        if (result.success) {
          // Successful sign up - user needs to verify email
          toast({
            title: 'Information',
            description: 'Verification email sent! Please check your inbox.',
            variant: 'info',
          });
          // router.refresh();
          setIsSign(true);
          // router.push(`/verify-pending?email=${encodeURIComponent(email)}`);
        } else if (result.error === "EMAIL_ALREADY_EXISTS") {
          console.log("Email already exists:", result.message);
          toast({
            title: 'Error',
            description: result.message,
            variant: 'destructive',
          });
          router.push('/signin');
        } else {
          console.error("Sign up failed:", result.message);
          toast({
            title: 'Error',
            description: result.message,
            variant: 'destructive',
          });
        }
      }
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: (error as Error).message || "Something went wrong. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to SecureGuard
        </CardTitle>
        <CardDescription>
          Sign in or sign up to start protecting your websites with advanced security scanning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-12 border-2 hover:border-blue-300 hover:bg-blue-50"
            disabled={isLoading}
          >
            <Mail className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            className="h-12 border-2 hover:border-gray-300 hover:bg-gray-50"
            disabled={isLoading}
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          {
            !isSign && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
            )
          }
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : (!isSign ? 'Create account' : 'Sign In')}
          </Button>
          <div className='space-y-2 text-sm text-center'>
            <p className='text-muted-foreground'>
              {!isSign ? 'Already' : `Don't`} have an account?
              <span
                className='ml-2 text-blue-600 cursor-pointer underline'
                onClick={() => setIsSign(prev => !prev)}
              >
                {!isSign ? 'Sign in' : 'Sign up'}
              </span>
            </p>
          </div>
        </form>

        <div className="text-center text-xs text-muted-foreground mt-4">
          By signing in or creating an account, you agree to our Terms of Service and Privacy Policy
        </div>
      </CardContent>
    </Card>
  );
}