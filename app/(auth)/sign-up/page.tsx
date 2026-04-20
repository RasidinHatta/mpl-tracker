import SignUpForm from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

export default function SignUpPage() {
  return (
    <div className="container min-h-screen flex items-center justify-center">
      <SignUpForm />
    </div>
  );
}
