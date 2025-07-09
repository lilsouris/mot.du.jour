import { Suspense } from 'react';
import { Login } from '../login';

export default function ConnectionPage() {
  return (
    <Suspense>
      <Login mode="signin" />
    </Suspense>
  );
}