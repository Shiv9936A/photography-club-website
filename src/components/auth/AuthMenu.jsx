import { GoogleLogin } from "@react-oauth/google";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { ChevronDown, LogOut, ShieldCheck, UserCircle2 } from "lucide-react";
import Button from "../Button";
import { useAuth } from "../../context/useAuth";

const roleLabel = (role) => {
  if (!role) return "user";
  return role;
};

export default function AuthMenu({ mobile = false, mobileOpen = false }) {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithGoogle,
    logout,
    authNotice,
    clearAuthNotice,
  } = useAuth();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && authNotice) {
      setExpanded(true);
    }
  }, [authNotice, isAuthenticated]);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse);
      setExpanded(false);
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-w-[220px] rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-xs text-gray-600">
        Restoring session...
      </div>
    );
  }

  if (!isAuthenticated) {
    const notice = authNotice?.message;

    if (mobile) {
      if (!mobileOpen) {
        return (
          <div className="min-w-[220px] rounded-[28px] border border-gray-200 bg-white/80 px-4 py-3 text-xs text-gray-600">
            Open the menu to sign in.
          </div>
        );
      }

      return (
        <div className="rounded-[28px] border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-start gap-3">
            <div className="mt-0.5 rounded-2xl bg-black/5 p-2">
              <UserCircle2 size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Club access</p>
              <p className="text-xs text-gray-500">
                Google sign-in only verifies identity. The backend decides role.
              </p>
            </div>
          </div>
          {notice && (
            <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {notice}
            </div>
          )}
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => console.log("Login Failed")}
            width={240}
            text="signin_with"
            shape="pill"
          />
          {notice && (
            <button
              type="button"
              className="mt-3 text-xs font-medium text-gray-500 underline"
              onClick={clearAuthNotice}
            >
              Dismiss
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="relative">
        <Button
          variant="secondary"
          size="sm"
          icon={<ChevronDown size={16} />}
          onClick={() => setExpanded((prev) => !prev)}
        >
          Sign in
        </Button>
        {expanded && (
          <div className="absolute right-0 top-[calc(100%+12px)] z-20 w-[320px] rounded-[28px] border border-gray-200 bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
            <div className="mb-3 flex items-start gap-3">
              <div className="mt-0.5 rounded-2xl bg-black/5 p-2">
                <UserCircle2 size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Club access</p>
                <p className="text-xs text-gray-500">
                  Google sign-in only verifies identity. The backend decides role.
                </p>
              </div>
            </div>
            {notice && (
              <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {notice}
              </div>
            )}
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => console.log("Login Failed")}
              width={288}
              text="signin_with"
              shape="pill"
            />
            {notice && (
              <button
                type="button"
                className="mt-3 text-xs font-medium text-gray-500 underline"
                onClick={clearAuthNotice}
              >
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white/80 px-3 py-2 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-black/5">
        {user?.picture ? (
          <img
            src={user.picture}
            alt={user.name || "User"}
            className="h-full w-full object-cover"
          />
        ) : (
          <UserCircle2 size={18} />
        )}
      </div>
      <div className="hidden sm:block">
        <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
        <p className="flex items-center gap-1 text-xs text-gray-500">
          <ShieldCheck size={12} />
          {roleLabel(user?.role)}
          {user?.isNitk ? " - NITK" : ""}
        </p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        icon={<LogOut size={14} />}
        onClick={() => {
          clearAuthNotice();
          logout();
        }}
      >
        Logout
      </Button>
    </div>
  );
}

AuthMenu.propTypes = {
  mobile: PropTypes.bool,
  mobileOpen: PropTypes.bool,
};
