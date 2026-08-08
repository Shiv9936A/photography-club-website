import { Link, Navigate, useLocation } from "react-router";
import { useEffect } from "react";
import PropTypes from "prop-types";
import { ShieldAlert, LogIn, Lock } from "lucide-react";
import AuthMenu from "./AuthMenu";
import { useAuth } from "../../context/useAuth";

const describeRequirement = ({ roles, nitkOnly }) => {
  if (nitkOnly) {
    return "NITK email required";
  }

  if (roles?.includes("admin")) {
    return "Admin access required";
  }

  if (roles?.includes("member")) {
    return "Member access required";
  }

  return "Login required";
};

const hasRequiredRole = (userRole, roles) => {
  if (!roles || roles.length === 0) {
    return true;
  }

  return roles.includes(userRole);
};

export default function ProtectedRoute({ children, roles = [], nitkOnly = false }) {
  const { isLoading, isAuthenticated, user, authNotice, setAuthNotice, clearAuthNotice } = useAuth();
  const location = useLocation();

  const roleAllowed = hasRequiredRole(user?.role, roles);
  const nitkAllowed = !nitkOnly || Boolean(user?.isNitk);
  const isAllowed = isAuthenticated && roleAllowed && nitkAllowed;

  const isLoggedOut = !isAuthenticated;
  const requirement = describeRequirement({ roles, nitkOnly });
  const message = isLoggedOut
    ? "Sign in with Google to continue."
    : nitkOnly && !user?.isNitk
      ? "This page is limited to NITK email addresses."
      : "Your current account does not have permission to view this page.";
  const nextNotice = (() => {
    if (isLoggedOut) {
      return {
        code: "login_required",
        message: "Please sign in to continue.",
      };
    }

    if (nitkOnly && !user?.isNitk) {
      return {
        code: "email_domain_restriction",
        message: "NITK email required for this page.",
      };
    }

    return {
      code: "access_denied",
      message: "Your current account does not have permission to view this page.",
    };
  })();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAllowed && authNotice) {
      clearAuthNotice();
      return;
    }

    if (!isAllowed && (!authNotice || authNotice.code !== nextNotice.code || authNotice.message !== nextNotice.message)) {
      setAuthNotice(nextNotice);
    }
  }, [authNotice, clearAuthNotice, isAllowed, isLoading, nextNotice, setAuthNotice]);

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-3xl items-center justify-center px-4 py-12">
        <div className="rounded-[32px] border border-gray-200 bg-white/90 px-8 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5">
            <Lock size={20} />
          </div>
          <p className="text-base font-medium text-gray-900">Checking your session...</p>
          <p className="mt-2 text-sm text-gray-500">We are restoring your login state.</p>
        </div>
      </div>
    );
  }

  if (isAllowed) {
    return children;
  }

  if (isLoggedOut) {
    return <Navigate to="/" replace state={{ from: location.pathname, authPrompt: true }} />;
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-[36px] border border-gray-200 bg-white/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-black/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-gray-600">
              <ShieldAlert size={14} />
              {requirement}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">
              Protected access
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-gray-600 md:text-base">
              {message}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Back home
              </Link>
            </div>
          </div>

          <div className="w-full max-w-md rounded-[28px] bg-[#faf7f0] p-4 md:p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-900">
              <LogIn size={16} />
              {isLoggedOut ? "Sign in to unlock this area" : "You are signed in"}
            </div>
            {!isLoggedOut ? (
              <div className="rounded-[24px] border border-gray-200 bg-white p-4 text-sm text-gray-600">
                <p className="font-medium text-gray-900">{user?.name || user?.email}</p>
                <p className="mt-1">Role: {user?.role || "user"}</p>
                <p className="mt-1">NITK: {user?.isNitk ? "Yes" : "No"}</p>
              </div>
            ) : null}
            <div className="mt-4">
              <AuthMenu />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.oneOf(["user", "member", "admin"])),
  nitkOnly: PropTypes.bool,
};
