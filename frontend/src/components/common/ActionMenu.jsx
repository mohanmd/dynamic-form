import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

const MENU_WIDTH = 180;

// three-dot menu for table rows.
// rendered into <body> so the table's scroll area doesn't cut it off.
// items: [{ label, to?, href?, onClick?, danger? }]
export default function ActionMenu({ items, label = 'Actions' }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const close = (focusButton = false) => {
    setOpen(false);
    setPosition(null);
    if (focusButton) buttonRef.current?.focus();
  };

  // place the menu under the button, or above it when there is no room below
  useLayoutEffect(() => {
    if (!open) return;
    const button = buttonRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current.offsetHeight;
    const openUp = window.innerHeight - button.bottom < menuHeight + 8 && button.top > menuHeight + 8;
    setPosition({
      top: openUp ? button.top - menuHeight - 4 : button.bottom + 4,
      left: Math.min(Math.max(8, button.right - MENU_WIDTH), window.innerWidth - MENU_WIDTH - 8),
    });
  }, [open]);

  // focus the first item once the menu is visible
  useEffect(() => {
    if (position) menuRef.current?.querySelector('[role="menuitem"]')?.focus();
  }, [position]);

  // close on outside click, Escape, scroll or resize
  useEffect(() => {
    if (!open) return undefined;
    const onMouseDown = (e) => {
      if (!menuRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) close();
    };
    const onKeyDown = (e) => e.key === 'Escape' && close(true);
    const onScroll = () => close();
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  // arrow keys move between items
  const onMenuKeyDown = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const menuItems = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
    const index = menuItems.indexOf(document.activeElement);
    const next = e.key === 'ArrowDown' ? index + 1 : index - 1;
    menuItems[(next + menuItems.length) % menuItems.length]?.focus();
  };

  const renderItem = (item) => {
    const className = `menu-item${item.danger ? ' menu-item-danger' : ''}`;
    if (item.to) {
      return (
        <Link key={item.label} role="menuitem" tabIndex={-1} className={className} to={item.to} onClick={() => close()}>
          {item.label}
        </Link>
      );
    }
    if (item.href) {
      return (
        <a key={item.label} role="menuitem" tabIndex={-1} className={className} href={item.href} target="_blank" rel="noreferrer" onClick={() => close()}>
          {item.label}
        </a>
      );
    }
    return (
      <button
        key={item.label}
        type="button"
        role="menuitem"
        tabIndex={-1}
        className={className}
        onClick={() => {
          close();
          item.onClick?.();
        }}
      >
        {item.label}
      </button>
    );
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`kebab-btn${open ? ' active' : ''}`}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span />
        <span />
        <span />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            className="menu-popover"
            style={{ width: MENU_WIDTH, top: position?.top ?? 0, left: position?.left ?? 0, visibility: position ? 'visible' : 'hidden' }}
            onKeyDown={onMenuKeyDown}
          >
            {items.map(renderItem)}
          </div>,
          document.body
        )}
    </>
  );
}
