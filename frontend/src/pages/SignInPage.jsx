import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
};

export default SignInPage;