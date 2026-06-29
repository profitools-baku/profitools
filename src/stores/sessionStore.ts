import { create } from "zustand";

function getOrCreateSessionId(): string {
  let sid = localStorage.getItem("profi_session_id");
  if (!sid) {
    sid = "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("profi_session_id", sid);
  }
  return sid;
}

interface SessionState {
  sessionId: string;
  cartCount: number;
  wishlistCount: number;
  refreshCart: () => void;
  refreshWishlist: () => void;
}

export const useSessionStore = create<SessionState>((_set) => ({
  sessionId: getOrCreateSessionId(),
  cartCount: 0,
  wishlistCount: 0,
  refreshCart: () => {
    // Will be called by components
  },
  refreshWishlist: () => {
    // Will be called by components
  },
}));

export { getOrCreateSessionId };
