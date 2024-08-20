import { gapi } from 'gapi-script';
import React from 'react';

interface User {
  name: string;
  email: string;
  imageUrl: string;
}

interface AuthContextType {
  status: 'unverified' | 'authenticated' | 'unauthenticated';
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType>({
  status: 'unverified',
  user: null,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const [status, setStatus] = React.useState<AuthContextType['status']>('unverified');
  const [user, setUser] = React.useState<User | null>(null);

  const initializeGapi = React.useCallback(async () => {
    try {
      await gapi.client.init({
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      });
      const authInstance = await gapi.auth2.init({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: import.meta.env.VITE_SCOPES,
      });

      const isSignedIn = authInstance.isSignedIn.get();
      setStatus(isSignedIn ? 'authenticated' : 'unauthenticated');

      if (isSignedIn) {
        const currentUser = authInstance.currentUser.get();
        const basicProfile = currentUser.getBasicProfile();
        setUser({
          name: basicProfile.getName(),
          email: basicProfile.getEmail(),
          imageUrl: basicProfile.getImageUrl(),
        });
      }
    } catch (error) {
      console.error('Error initializing Google API client:', error);
      setStatus('unauthenticated');
    }
  }, []);

  const signIn = React.useCallback(async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signIn();

      const currentUser = authInstance.currentUser.get();
      const basicProfile = currentUser.getBasicProfile();

      setUser({
        name: basicProfile.getName(),
        email: basicProfile.getEmail(),
        imageUrl: basicProfile.getImageUrl(),
      });

      setStatus('authenticated');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signOut();

      setUser(null);
      setStatus('unauthenticated');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  React.useEffect(() => {
    gapi.load('client:auth2', initializeGapi);
  }, [initializeGapi]);

  return (
    <AuthContext.Provider value={{ status, user, signIn, signOut }}>
      {props.children}
    </AuthContext.Provider>
  );
};
