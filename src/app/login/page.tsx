import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome</h1>
      <AuthForm />
    </div>
  );
}
