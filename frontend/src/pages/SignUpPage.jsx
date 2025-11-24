import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
};

export default SignUpPage;