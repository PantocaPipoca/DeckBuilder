// client/src/components/ShareDeckPopup.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateDeck, createDeck, getDeckById } from '../services/api';
import styles from '../styles/ShareDeckPopup.module.css';
import type { ShareDeckPopupProps } from '../types';

function ShareDeckPopup({ deck, deckId, deckSlot, onClose, onUpdate }: ShareDeckPopupProps) {
  const { user } = useAuth();
  const [deckName, setDeckName] = useState(`Deck ${deckSlot + 1}`);
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const shareUrl = deckId && user 
    ? `${window.location.origin}/deck/${user.id}/${deckId}` 
    : '';

  // Load existing deck data if deckId exists
  useEffect(() => {
    async function loadExistingDeck() {
      if (deckId) {
        try {
          const existingDeck = await getDeckById(deckId);
          setDeckName(existingDeck.name);
          setDescription(existingDeck.description || '');
          setIsPublic(existingDeck.isPublic); // MANTÉM O ESTADO PÚBLICO
        } catch (error) {
          console.error('Error loading deck:', error);
        }
      }
      setLoading(false);
    }
    loadExistingDeck();
  }, [deckId]);

  async function handleSave() {
    if (!deckName.trim()) {
      alert('Please enter a deck name');
      return;
    }

    setSaving(true);
    try {
      const cardNames = deck.map(c => c.name);
      const deckData = {
        name: deckName,
        description: description || `Deck slot ${deckSlot + 1}`,
        cardNames,
        slot: deckSlot,
        isPublic,
      };

      let result;
      if (deckId) {
        result = await updateDeck(deckId, deckData);
      } else {
        result = await createDeck(deckData);
      }

      onUpdate(result);
      onClose();
    } catch (error: any) {
      console.error('Error saving deck:', error);
      alert(error.response?.data?.message || 'Failed to save deck');
    } finally {
      setSaving(false);
    }
  }

  function handleCopyLink() {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2067);
    }
  }

  if (loading) {
    return (
      <>
        <div className={styles.backdrop} onClick={onClose} />
        <div className={styles.popup}>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
          <div style={{ textAlign: 'center', padding: '20px', color: 'white' }}>
            Loading...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      
      <div className={styles.popup}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        
        <h2 className={styles.title}>Share Deck</h2>

        {/* Deck Name */}
        <div className={styles.inputGroup}>
          <label htmlFor="deckName">Deck Name</label>
          <input
            id="deckName"
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="Enter deck name"
            maxLength={50}
            disabled={saving}
          />
        </div>

        {/* Description */}
        <div className={styles.inputGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your deck strategy..."
            maxLength={200}
            rows={3}
            disabled={saving}
          />
        </div>

        {/* Public Toggle */}
        <div className={styles.toggleGroup}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={saving}
            />
            <span className={styles.toggleText}>Make deck public</span>
          </label>
          <p className={styles.toggleHint}>
            Public decks will appear in the Social page
          </p>
        </div>

        {/* Share Link */}
        {deckId && (
          <div className={styles.linkSection}>
            <label>Share Link</label>
            <div className={styles.linkContainer}>
              <input
                type="text"
                value={shareUrl}
                readOnly
                className={styles.linkInput}
              />
              <button 
                onClick={handleCopyLink}
                className={styles.copyButton}
              >
                {copied ? '✓' : '📋'}
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <button 
          onClick={handleSave}
          className={styles.saveButton}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </>
  );
}

export default ShareDeckPopup;