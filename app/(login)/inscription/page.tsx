import { Suspense } from 'react';
import { Login } from '../login';

export default function InscriptionPage() {
  return (
    <Suspense>
      <Login mode="signup" />
    </Suspense>
  );
}
