import Input from "@/components/general/Input";
import Button from "@/components/general/Button";
import Toast from "@/components/general/Toast";
import Image from "next/image";
import { useState, useEffect } from "react";
import { login } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const greetings = ["Hello!", "Kamusta!", "안녕하세요!"];
  const [currentGreeting, setCurrentGreeting] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false); // this is fade out effect
      setTimeout(() => {
        setCurrentGreeting((prev) => (prev + 1) % greetings.length);
        setIsVisible(true); // this is fade in effect
      }, 300); // time for fade transition
    }, 4000); // change text every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      await login(formData);
      // so the toast can show success true, it uses the loginSuccess param
      router.push("/?loginSuccess=true");
      router.refresh();
    } catch (error) {
      setToastMessage(
        "Invalid credentials. Please check your email and password."
      );
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />

      <div className="bg-background h-screen w-full grid grid-cols-1 lg:grid-cols-2">
        <div className="h-full w-full flex flex-col">
          <div className="flex items-center h-auto px-5 lg:px-8 py-4 lg:h-[5.3125rem]">
            <Image
              src="/logo.png"
              alt="Sharerapy Logo"
              width={40}
              height={40}
              className="w-10 h-10 lg:w-[2.5rem] lg:h-[2.5rem] hover:cursor-pointer"
            />
            <h1 className="hidden lg:block font-Noto-Sans text-[1.5rem] font-black ml-2.5">
              <span className="text-primary">share</span>rapy.
            </h1>
          </div>

          <div className="flex flex-col flex-1 justify-center items-center gap-14 mb-8">
            <div className="flex flex-col gap-5 items-center justify-center">
              <h1
                className={`font-Noto-Sans text-3xl lg:text-5xl text-black font-bold transition-opacity duration-300 ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                {greetings[currentGreeting]}
              </h1>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-10 items-center justify-center w-full"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                label="Email"
                width="w-3/4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Enter your password"
                label="Password"
                width="w-3/4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button type="submit" disabled={isLoading} className="w-3/4">
                Log In
              </Button>
            </form>
          </div>

          <p className="font-Noto-Sans text-xs text-darkgray text-center pb-8">
            All rights reserved Sharerapy 2025
          </p>
        </div>

        <div className="relative h-full w-full overflow-hidden hidden lg:block">
          <Image
            src="/LoginBG.jpg"
            alt="Login Image"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 from-[26%] to-primary/80 to-[86%]" />

          {/* Text content */}
          <div className="absolute inset-0 flex flex-col justify-end text-white px-16 pb-8">
            <h2 className="font-Noto-Sans text-2xl font-bold mb-4">
              Query with ease.
            </h2>
            <p className="font-Noto-Sans text-md">
              Your unified repository for therapy records around the world.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
