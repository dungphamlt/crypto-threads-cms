"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect } from "react";

export default function Home() {
  // if pathname == "/", redirect to /dashboard
  const router = useRouter();
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  });
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <Image
        src="/logo.png"
        alt="Logo"
        width={150}
        height={150}
        className="mb-4"
      />
      <h1 className="text-2xl font-bold text-gray-800">
        Welcome to Crypto Threads CMS
      </h1>
    </div>
  );
}
