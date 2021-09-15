import * as React from "react";
type AuthContext = {
  user: UserInfo;
  setUserInfo: (user: UserInfo) => void;
};

type UserInfo = {
  email: string | null;
  role: string | null;
  id: string | null;
};

const authContext = React.createContext<AuthContext>({
  user: {
    email: null,
    role: null,
    id: null,
  },
  setUserInfo: () => {},
});
const useAuth = () => React.useContext(authContext);

const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = React.useState(() => {
    if (typeof window !== "undefined") {
      console.log("parse?!");

      return JSON.parse(localStorage.getItem("OBLEAGUE_USER") || "{}");
    }
    return {};
  });

  React.useEffect(() => {
    localStorage.setItem("OBLEAGUE_USER", JSON.stringify(user));
  }, [user]);

  const setUserInfo = (user: UserInfo) => {
    setUser(user);
  };

  return (
    <authContext.Provider value={{ user, setUserInfo }}>
      {children}
    </authContext.Provider>
  );
};

export { AuthProvider, useAuth };
