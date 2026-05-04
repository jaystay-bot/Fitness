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
