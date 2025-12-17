import { getAuth, type User } from "firebase/auth";

type SecurityRuleContext = {
  path: string;
  operation: "get" | "list" | "create" | "update" | "delete" | "write";
  requestResourceData?: any;
};

interface FirebaseAuthToken {
  name: string | null;
  email: string | null;
  email_verified: boolean;
  phone_number: string | null;
  sub: string;
  firebase: {
    identities: Record<string, string[]>;
    sign_in_provider: string;
    tenant: string | null;
  };
}

interface FirebaseAuthObject {
  uid: string;
  token: FirebaseAuthToken;
}

interface SecurityRuleRequest {
  auth: FirebaseAuthObject | null;
  method: string;
  path: string;
  resource?: {
    data: any;
  };
}

/**
 * Builds a security-rule-compliant auth object from the Firebase User.
 * @param currentUser The currently authenticated Firebase user.
 * @returns An object that mirrors request.auth in security rules, or null.
 */
function buildAuthObject(currentUser: User | null): FirebaseAuthObject | null {
  if (!currentUser) {
    return null;
  }

  const token: FirebaseAuthToken = {
    name: currentUser.displayName,
    email: currentUser.email,
    email_verified: currentUser.emailVerified,
    phone_number: currentUser.phoneNumber,
    sub: currentUser.uid,
    firebase: {
      identities: currentUser.providerData.reduce((acc, p) => {
        if (p.providerId) {
          acc[p.providerId] = [p.uid];
        }
        return acc;
      }, {} as Record<string, string[]>),
      sign_in_provider: currentUser.providerData[0]?.providerId || "custom",
      tenant: currentUser.tenantId,
    },
  };

  return {
    uid: currentUser.uid,
    token: token,
  };
}

/**
 * Builds the complete, simulated request object for the error message.
 * It safely tries to get the current authenticated user.
 * @param context The context of the failed Firestore operation.
 * @returns A structured request object.
 */
function buildRequestObject(context: SecurityRuleContext): SecurityRuleRequest {
  let authObject: FirebaseAuthObject | null = null;
  try {
    // Safely attempt to get the current user.
    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      authObject = buildAuthObject(currentUser);
    }
  } catch {
    // This will catch errors if the Firebase app is not yet initialized.
    // In this case, we'll proceed without auth information.
  }

  return {
    auth: authObject,
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`,
    resource: context.requestResourceData
      ? { data: context.requestResourceData }
      : undefined,
  };
}

/**
 * Builds the final, formatted error message for better debugging.
 * @param context The context of the failed Firestore operation.
 * @returns A detailed error message string.
 */
function buildErrorMessage(context: SecurityRuleContext): string {
  const request = buildRequestObject(context);

  return `Firestore Permission Denied
  
Operation: ${context.operation}
Path: ${context.path}
${
  context.requestResourceData
    ? `Data: ${JSON.stringify(context.requestResourceData, null, 2)}`
    : ""
}

User Info:
${
  request.auth
    ? `- UID: ${request.auth.uid}
- Email: ${request.auth.token.email}
- Email Verified: ${request.auth.token.email_verified}`
    : "- Not authenticated"
}

Request Object (for security rules):
${JSON.stringify(request, null, 2)}

Please check your Firestore security rules.`;
}

/**
 * Custom error class for Firestore permission errors.
 * Provides detailed context about the failed operation.
 */
export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;
  public readonly request: SecurityRuleRequest;

  constructor(context: SecurityRuleContext) {
    const message = buildErrorMessage(context);
    super(message);

    this.name = "FirestorePermissionError";
    this.context = context;
    this.request = buildRequestObject(context);

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }
}
