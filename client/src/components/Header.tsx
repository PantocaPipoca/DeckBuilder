// client/src/components/Header.tsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Header.module.css';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.logo}>DeckBuilder</h1>
        
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            Welcome, <strong>{user?.name}</strong>
          </span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;