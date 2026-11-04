// Pure routing rules for auth, kept separate so they're easy to unit test.

/** Pages that require a logged-in user. Later features add /dashboard, etc. */
export const PROTECTED_PREFIXES = ["/walks", "/dogs"];

/** Pages only for logged-out visitors. */
export const AUTH_PAGES = ["/login", "/signup"];

export const HOME_FOR_USERS = "/walks";
export const LOGIN_PAGE = "/login";

function matches(path: string, prefix: string) {
  return path === prefix || path.startsWith(prefix + "/");
}

/**
 * Returns the path to redirect to, or null if the request can continue.
 * - Logged out + protected page → /login
 * - Logged in + /login or /signup → /walks
 */
export function authRedirect(pathname: string, isLoggedIn: boolean): string | null {
  if (!isLoggedIn && PROTECTED_PREFIXES.some((p) => matches(pathname, p))) {
    return LOGIN_PAGE;
  }
  if (isLoggedIn && AUTH_PAGES.some((p) => matches(pathname, p))) {
    return HOME_FOR_USERS;
  }
  return null;
}
