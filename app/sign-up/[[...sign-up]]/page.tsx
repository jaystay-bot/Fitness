import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Sign up · Apex Protocol",
};

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-ink text-paper flex items-center justify-center p-6">
      <SignUp
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
