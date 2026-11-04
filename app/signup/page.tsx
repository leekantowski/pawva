import AuthForm from "@/components/AuthForm";
import { signUp } from "@/app/auth/actions";

export const metadata = { title: "Sign up · Pawva" };

export default function SignupPage() {
  return (
    <main className="container narrow">
      <AuthForm mode="signup" action={signUp} />
    </main>
  );
}
