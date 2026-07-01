import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-sand/30 px-4 py-16">
      <SignUp />
    </div>
  );
}
