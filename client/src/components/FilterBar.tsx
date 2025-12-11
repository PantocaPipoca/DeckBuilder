// src/components/FilterBar.tsx

import type { FilterState, SortBy } from '../types/index';
import styles from '../styles/FilterBar.module.css';

function FilterBar({ sortBy, order, onSortChange, onOrderChange } : FilterState) {
  
  // Cicle through sortBy options
  function cycleSortBy() {
    const cycle: Record<SortBy, SortBy> = { 
      rarity: 'name', 
      name: 'elixir', 
      elixir: 'rarity' 
    };
    onSortChange(cycle[sortBy]);
  }
  
  // Toggle asc and desc
  function toggleOrder() {
    onOrderChange(order === 'asc' ? 'desc' : 'asc');
  }
  
  // Label for the sort button
  const sortLabel = {
    rarity: 'By Rarity',
    name: 'By Name',
    elixir: 'By Elixir'
  }[sortBy];
  
  return (
    <div className={styles.filterBar}>
      {/* Sort Button */}
      <button className={styles.sortButton} onClick={cycleSortBy}>
        {sortLabel}
      </button>
      
      {/* Order Button */}
      <button className={styles.orderButton} onClick={toggleOrder}>
        {order === 'asc' ? '▲' : '▼'}
      </button>
    </div>
  );
}

export default FilterBar;