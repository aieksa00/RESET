import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';
import { RESETRoutes } from 'models';
import logo from '../assets/logo.png';

export function LandingPage() {
  const navigate = useNavigate();

  const handleHackerClick = () => {
    navigate(`${RESETRoutes.Hacks}`); // Navigate to the "Hacker" page
  };

  const handleHackedClick = () => {
    navigate(`${RESETRoutes.ReportHack}`); // Navigate to the "Hacked" page
  };

  return (
    <div className={styles['loading-page']}>
      <div className={styles['left-side']}>
        <h1 className={styles['landing-page-h1']} onClick={handleHackerClick}>
          I AM HACKER
        </h1>
      </div>
      <div className={styles['center-logo']}>
        <img src={logo} alt="RESET Logo" className={styles['logo']} />
      </div>
      <div className={styles['right-side']}>
        <h1 className={styles['landing-page-h1']} onClick={handleHackedClick}>
          I AM HACKED
        </h1>
      </div>
    </div>
  );
}

export default LandingPage;
