import { ThemeProvider } from './src/theme/ThemeProvider';
import { ThemePreviewScreen } from './src/screens/ThemePreviewScreen';

export default function App() {
  return (
    <ThemeProvider initialPreference="system">
      <ThemePreviewScreen />
    </ThemeProvider>
  );
}
