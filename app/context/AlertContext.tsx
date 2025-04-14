import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertDialog, AlertButton } from '../components/ui/AlertDialog';

type AlertType = 'info' | 'success' | 'error' | 'warning' | 'question';

type AlertOptions = {
  title: string;
  message: string;
  buttons?: AlertButton[];
  type?: AlertType;
};

type AlertContextType = {
  alert: (options: AlertOptions) => void;
  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    type?: AlertType
  ) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  closeAlert: () => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

type AlertProviderProps = {
  children: ReactNode;
};

export function AlertProvider({ children }: AlertProviderProps) {
  const [visible, setVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<AlertOptions>({
    title: '',
    message: '',
    buttons: [],
    type: 'info',
  });

  const showAlert = (options: AlertOptions) => {
    setCurrentAlert(options);
    setVisible(true);
  };

  const closeAlert = () => {
    setVisible(false);
  };

  // Convenience methods
  const alert = (options: AlertOptions) => {
    showAlert({
      ...options,
      buttons: options.buttons || [{ text: 'OK', style: 'default' }],
    });
  };

  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    type: AlertType = 'question'
  ) => {
    showAlert({
      title,
      message,
      type,
      buttons: [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Confirm',
          style: 'default',
          onPress: onConfirm,
        },
      ],
    });
  };

  const success = (message: string, title: string = 'Success') => {
    showAlert({
      title,
      message,
      type: 'success',
      buttons: [{ text: 'OK', style: 'default' }],
    });
  };

  const error = (message: string, title: string = 'Error') => {
    showAlert({
      title,
      message,
      type: 'error',
      buttons: [{ text: 'OK', style: 'default' }],
    });
  };

  const info = (message: string, title: string = 'Information') => {
    showAlert({
      title,
      message,
      type: 'info',
      buttons: [{ text: 'OK', style: 'default' }],
    });
  };

  const warning = (message: string, title: string = 'Warning') => {
    showAlert({
      title,
      message,
      type: 'warning',
      buttons: [{ text: 'OK', style: 'default' }],
    });
  };

  return (
    <AlertContext.Provider
      value={{
        alert,
        confirm,
        success,
        error,
        info,
        warning,
        closeAlert,
      }}
    >
      {children}
      <AlertDialog
        visible={visible}
        title={currentAlert.title}
        message={currentAlert.message}
        buttons={currentAlert.buttons}
        type={currentAlert.type}
        onDismiss={closeAlert}
      />
    </AlertContext.Provider>
  );
} 