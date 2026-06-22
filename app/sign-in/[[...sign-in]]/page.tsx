import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Sign in · Apex Protocol",
};

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-ink text-paper flex items-center justify-center p-6">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#2563EB",
            colorText: "#0F1B2D",
            colorBackground: "#FFFFFF",
            colorInputBackground: "#FFFFFF",
            colorInputText: "#0F1B2D",
          },
        }}
      />
    </main>
  );
}
