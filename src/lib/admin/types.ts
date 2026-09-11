export type AdminRole = "superadmin" | "admin" | "sponsoring";

export interface SessionPayload {
  /** username */
  u: string;
  /** expiry, unix seconds */
  exp: number;
  /** true only while the account must change its password before doing anything else */
  p?: true;
  r: AdminRole[];
}

export interface LocalUser {
  username: string;
  passwordHash: string;
  mustChangePassword?: boolean;
  roles?: AdminRole[];
}
