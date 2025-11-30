"use client";

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthErrorClient() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  let errorTitle = 'Authentication Error';
  let errorDescription = 'An error occurred during authentication.';

  if (error === 'CredentialsSignin') {
    errorTitle = 'Sign in failed';
    errorDescription = 'The credentials you entered are invalid. Please try again.';
  } else if (error === 'Configuration') {
    errorTitle = 'Configuration error';
    errorDescription = 'There is an issue with the authentication configuration.';
  } else if (error === 'AccessDenied') {
    errorTitle = 'Access denied';
    errorDescription = 'You do not have permission to access this resource.';
  } else if (error === 'Verification') {
    errorTitle = 'Verification failed';
    errorDescription = 'The verification token is invalid or has expired.';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{errorTitle}</CardTitle>
          <CardDescription>
            {errorDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Button asChild>
            <Link href="/auth/login">Kembali ke Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}