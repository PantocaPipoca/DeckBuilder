// src/components/FilterBar.tsx

import type { FilterState, SortBy } from '../types/index';
import styles from '../styles/FilterBar.module.css';

function FilterBar({ sortBy, order, onSortChange, onOrderChange } : FilterState) {
  
  // Cicla entre: rarity → name → elixir
  function cycleSortBy() {
    const cycle: Record<SortBy, SortBy> = { 
      rarity: 'name', 
      name: 'elixir', 
      elixir: 'rarity' 
    };
    onSortChange(cycle[sortBy]);
  }
  
  // Toggle entre asc ⇄ desc
  function toggleOrder() {
    onOrderChange(order === 'asc' ? 'desc' : 'asc');
  }
  
  // Label do botão
  const sortLabel = {
    rarity: 'By Rarity',
    name: 'By Name',
    elixir: 'By Elixir'
  }[sortBy];
  
  return (
    <div className={styles.filterBar}>
      {/* Botão de Sort (clica para ciclar) */}
      <button className={styles.sortButton} onClick={cycleSortBy}>
        {sortLabel}
      </button>
      
      {/* Botão de Order (▲ ou ▼) */}
      <button className={styles.orderButton} onClick={toggleOrder}>
        {order === 'asc' ? '▲' : '▼'}
      </button>
    </div>
  );
}

export default FilterBar;