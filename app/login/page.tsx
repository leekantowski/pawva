import AuthForm from "@/components/AuthForm";
import { logIn } from "@/app/auth/actions";

export const metadata = { title: "Log in · Pawva" };

export default function LoginPage() {
  return (
    <main className="container narrow">
      <AuthForm mode="login" action={logIn} />
    </main>
  );
}
