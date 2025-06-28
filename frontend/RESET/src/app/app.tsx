// Uncomment this line to use CSS modules
import styles from './app.module.css';

import { Route, Routes, useLocation } from 'react-router-dom';
import { RESETRoutes } from 'models';
import { LandingPage } from 'LandingPage';
import { HacksPage } from 'HacksPage';
import { CreateHackPage } from 'CreateHackPage';
import { HackDetailsPage } from 'HackDetailsPage';

import '@rainbow-me/rainbowkit/styles.css';
import { ConnectButton, getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: false, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export function App() {
  
  const location = useLocation();
  const isFullPageRoute = location.pathname === RESETRoutes.Landing;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
        {isFullPageRoute ? (
            // Render LandingPage as a full-page route
            <Routes>
              <Route path={RESETRoutes.Landing} element={<LandingPage />} />
            </Routes>
          ) : (
            // Render the layout for other routes
            <div className={styles['app-layout']}>
              {/* Left Sidebar */}
              <div className={styles['sidebar']}></div>

              {/* Middle Routes */}
              <div className={styles['routes']}>
                <div className={styles['header']}>
                  <span className={styles['reset-label']}>RESET</span>
                  <div className={styles['connect-button-container']}>
                    <ConnectButton />
                  </div>
                </div>
                <Routes>
                  <Route path={RESETRoutes.Hacks} element={<HacksPage />} />
                  <Route path={RESETRoutes.ReportHack} element={<CreateHackPage />} />
                  <Route path={RESETRoutes.HackDetails} element={<HackDetailsPage />} />
                </Routes>
              </div>
            </div>
          )}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
