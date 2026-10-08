import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { FaRegUser } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";

const AuthTest = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Close modal when pressing Escape
  useEffect(() => {
    // Restore logged-in user after page refresh
    const storedUser = localStorage.getItem("authUser");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to restore user:", error);
        localStorage.removeItem("authUser");
        localStorage.removeItem("authToken");
      }
    }

    // Close modal when pressing Escape
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSuccess = async (credentialResponse) => {
    console.log("Google credential received:", credentialResponse);

    if (!credentialResponse?.credential) {
      console.error("No Google credential received");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/google",
        {
          token: credentialResponse.credential,
        },
      );

      console.log("Backend Response:", data);

      if (data.success) {
        // Save JWT for authenticated API requests
        localStorage.setItem("authToken", data.token);

        // Save user information
        localStorage.setItem("authUser", JSON.stringify(data.user));

        setUser(data.user);
        setIsOpen(false);
      }
    } catch (err) {
      console.error(
        "Backend authentication failed:",
        err.response?.data || err,
      );
    }
  };

  const handleLogout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");

  setUser(null);
};
  return (
    <>
      {/* =========================
          NAVBAR AUTH BUTTON
      ========================== */}

      {!user ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="
            flex items-center gap-2
            px-5 py-2.5
            rounded-full
            border border-gray-300
            bg-white
            text-gray-800
            hover:bg-gray-50
            transition-all duration-200
          "
        >
          <FaRegUser size={15} />
          <span>Sign In</span>
        </button>
      ) : (
        <div className="relative">
          {/* Profile Button */}
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="
      flex items-center gap-2
      px-4 py-2.5
      rounded-full
      border border-gray-300
      bg-white
      text-gray-800
      hover:bg-gray-50
      transition-all duration-200
      cursor-pointer
    "
          >
            <img
              src={user.picture}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover"
            />

            <span className="max-w-[120px] truncate">{user.name}</span>

            {/* Arrow */}
            <span
              className={`
        text-gray-500 text-xs
        transition-transform duration-200
        ${profileOpen ? "rotate-180" : ""}
      `}
            >
              ▼
            </span>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div
              className="
        absolute right-0 top-full mt-2
        w-56
        bg-white
        border border-gray-200
        rounded-xl
        shadow-xl
        overflow-hidden
        z-[100000]
      "
            >
              {/* User information */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-medium text-gray-900 truncate">
                  {user.name}
                </p>

                <p className="text-xs text-gray-500 truncate mt-1">
                  {user.email}
                </p>

                {user.isNitk && (
                  <span
                    className="
            inline-block
            mt-2
            px-2 py-1
            text-xs
            rounded-full
            bg-green-50
            text-green-700
          "
                  >
                    NITK Student
                  </span>
                )}
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="
          w-full
          px-4 py-3
          text-left
          text-sm
          text-red-600
          hover:bg-red-50
          transition-colors
          cursor-pointer
        "
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================
          LOGIN MODAL
      ========================== */}

      {isOpen && (
        <div
          className="
            fixed inset-0
            z-[99999]
            flex items-center justify-center
            bg-black/50
            backdrop-blur-[2px]
            p-4
          "
          onMouseDown={(event) => {
            // Close only when clicking the backdrop
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          {/* Modal Card */}
          <div
            className="
              relative
              w-full max-w-[420px]
              bg-white
              rounded-2xl
              shadow-2xl
              overflow-hidden
            "
          >
            {/* Close Button */}
            <button
              type="button"
              aria-label="Close login"
              onClick={() => setIsOpen(false)}
              className="
                absolute
                top-4 right-4
                z-10
                flex items-center justify-center
                w-9 h-9
                rounded-full
                text-gray-500
                hover:bg-gray-100
                hover:text-black
                transition
              "
            >
              <AiOutlineClose size={22} />
            </button>

            {/* Modal Content */}
            <div className="px-8 py-9 sm:px-10">
              {/* Heading */}
              <div className="text-center">
                <div
                  className="
                    mx-auto mb-5
                    w-14 h-14
                    rounded-full
                    bg-gray-100
                    flex items-center justify-center
                  "
                >
                  <FaRegUser size={22} className="text-gray-700" />
                </div>

                <h2 className="text-2xl font-semibold text-gray-900">
                  Welcome to PClub
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Sign in to continue to Photography Club
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-7">
                <div className="h-px flex-1 bg-gray-200" />

                <span className="text-xs text-gray-400">CONTINUE WITH</span>

                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Google Login */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => {
                    console.log("Google Login Failed");
                  }}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                />
              </div>

              {/* Bottom information */}
              <p className="text-center text-xs text-gray-400 mt-6">
                Use your Google account to sign in.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthTest;
