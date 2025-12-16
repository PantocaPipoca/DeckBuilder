// client/src/components/NavBar.tsx
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/NavBar.module.css';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'battle', label: 'Battle', icon: '⚔️', path: null, disabled: true },
    { id: 'decks', label: 'Decks', icon: '🎴', path: '/decks', disabled: false },
    { id: 'cards', label: 'Cards', icon: '🃏', path: null, disabled: true },
    { id: 'social', label: 'Social', icon: '👥', path: '/social', disabled: false },
    { id: 'shop', label: 'Shop', icon: '🛒', path: null, disabled: true },
  ];

  function handleNavClick(item: typeof navItems[0]) {
    if (item.disabled) return;
    if (item.path) navigate(item.path);
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {navItems.map((item) => {
          const isActive = item.path && location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${isActive ? styles.active : ''} ${item.disabled ? styles.disabled : ''}`}
              onClick={() => handleNavClick(item)}
              disabled={item.disabled}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {isActive && <div className={styles.activeIndicator} />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default NavBar;