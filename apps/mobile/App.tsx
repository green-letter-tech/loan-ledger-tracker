import { ThemeProvider } from './src/theme/ThemeProvider';
import { DevPreviewScreen } from './src/screens/DevPreviewScreen';

export default function App() {
  return (
    <ThemeProvider initialPreference="system">
      <DevPreviewScreen />
    </ThemeProvider>
  );
}
