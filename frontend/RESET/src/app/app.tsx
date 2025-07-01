// Uncomment this line to use CSS modules
import styles from './app.module.css';
import logo from '../assets/logo.png';

import { Route, Routes, useLocation } from 'react-router-dom';
import { RESETRoutes } from 'models';
import { LandingPage } from 'LandingPage';
import { HacksPage } from 'HacksPage';
import { CreateHackPage } from 'CreateHackPage';
import { HackDetailsPage } from 'HackDetailsPage';
import { ChatWindow } from 'ChatWindow';
import { ChatWindowProvider, useChatWindows } from '@providers';

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

// Create a separate component for the app content
function AppContent() {
  const location = useLocation();
  const isFullPageRoute = location.pathname === RESETRoutes.Landing;
  const { chatWindows } = useChatWindows(); // Now this is safe to use

  return (
    <div>
      {isFullPageRoute ? (
        <Routes>
          <Route path={RESETRoutes.Landing} element={<LandingPage />} />
        </Routes>
      ) : (
        <div className={styles['app-layout']}>
          <div className={styles['routes']}>
            <div className={styles['header']}>
              <span className={styles['reset-label']}>RESET</span>
              <img src={logo} alt="RESET Logo" className={styles['logo']} />
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

          {Array.from(chatWindows.entries()).map(([id, chat]) => (
            <ChatWindow key={id} id={id} title={`Chat - ${chat.protocolName}`} hackerAddress={chat.hackerAddress} creatorAddress={chat.creatorAddress} sharedSecret={chat.sharedSecret} incidentAddress={chat.incidentAddress}/>
          ))}
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ChatWindowProvider>
            <AppContent />
          </ChatWindowProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
