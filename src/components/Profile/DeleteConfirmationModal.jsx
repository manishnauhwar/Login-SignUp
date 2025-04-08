import React from 'react';
import { useTranslation } from "react-i18next";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, userName }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="delete-confirmation-modal">
        <h3>{t("confirmDelete")}</h3>
        <p>{t("deleteUserConfirmation", { userName })}</p>
        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onClose}>
            {t("cancel")}
          </button>
          <button className="btn-delete" onClick={onConfirm}>
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 