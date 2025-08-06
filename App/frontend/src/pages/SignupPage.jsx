import SignUp from "../components/SignUp";
import UnauthenticatedHeader from "../components/UnauthenticatedHeader";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#012A3D] text-white">
      <UnauthenticatedHeader />
      <SignUp />
    </div>
  );
}
