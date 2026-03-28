import type { ReactNode } from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { Cross2Icon } from '@radix-ui/react-icons';
import styles from './Dialog.module.css';

interface DialogProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Dialog({ trigger, title, description, children }: DialogProps) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay} />
        <DialogPrimitive.Content className={styles.content}>
          <div className={styles.header}>
            <DialogPrimitive.Title className={styles.title}>
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className={styles.closeButton} aria-label="Close">
              <Cross2Icon width={16} height={16} />
            </DialogPrimitive.Close>
          </div>
          {description && (
            <DialogPrimitive.Description className={styles.description}>
              {description}
            </DialogPrimitive.Description>
          )}
          <div className={styles.body}>{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
