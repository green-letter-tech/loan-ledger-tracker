import { useEffect } from 'react';

import { initializeDatabase } from './src/data/db/client';
import { DevPreviewScreen } from './src/screens/DevPreviewScreen';
import { ThemeProvider } from './src/theme/ThemeProvider';

export default function App() {
  useEffect(() => {
    initializeDatabase().catch((error) => {
      console.error('Database init failed:', error);
    });
  }, []);

  return (
    <ThemeProvider initialPreference="system">
      <DevPreviewScreen />
    </ThemeProvider>
  );
}
