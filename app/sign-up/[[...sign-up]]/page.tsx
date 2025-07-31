import { SignUp } from "@clerk/nextjs"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="text-3xl font-bold instagram-gradient bg-clip-text text-transparent">Instagram</div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: "bg-blue-500 hover:bg-blue-600 text-sm normal-case",
                card: "shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
                socialButtonsBlockButtonText: "text-gray-700 font-normal",
                formFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                footerActionLink: "text-blue-600 hover:text-blue-500",
              },
            }}
            redirectUrl="/"
          />
        </div>
      </div>
    </div>
  )
}
