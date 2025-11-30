import AuthErrorClient from '@/components/auth-error-client-fixed';
import { Suspense } from 'react';

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <AuthErrorClient />
    </Suspense>
  );
}
