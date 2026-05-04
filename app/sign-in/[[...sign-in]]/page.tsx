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
            colorPrimary: "#D4FF3A",
            colorText: "#FAFAF7",
            colorBackground: "#0A0A0A",
            colorInputBackground: "#0A0A0A",
            colorInputText: "#FAFAF7",
          },
        }}
      />
    </main>
  );
}
