import SignIn from "../components/SignIn";
import UnauthenticatedHeader from "../components/UnauthenticatedHeader";

export default function SigninPage() {
  return (
    <div className="min-h-screen bg-[#012A3D] text-white">
      <UnauthenticatedHeader />
      <SignIn />
    </div>
  );
}