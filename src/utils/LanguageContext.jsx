import { createContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n, { translations } from "../i18n";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { t } = useTranslation();
  const storedLanguage = localStorage.getItem("language") || "English";
  const [language, setLanguage] = useState(storedLanguage);

  useEffect(() => {
    localStorage.setItem("language", language);
    i18n.changeLanguage(language);
  }, [language]);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  const translate = (key, options = {}) => {
    if (!key) return "";

    if (key.includes(".")) {
      const parts = key.split(".");
      const namespace = parts[0];
      const nestedKey = parts[1];

      if (["priorities", "statuses"].includes(namespace)) {
        return t(`${namespace}.${nestedKey}`, { defaultValue: nestedKey });
      }
    }

    return t(key, options);
  };

  const translateTaskContent = (task, translateFields = ['status', 'priority']) => {
    if (!task) return task;

    const translatedTask = { ...task };

    if (!translatedTask._originalData) {
      translatedTask._originalData = {};
      for (const field of translateFields) {
        if (translatedTask[field]) {
          translatedTask._originalData[field] = translatedTask[field];
        }
      }
    }

    if (translatedTask.status && translateFields.includes('status')) {
      const originalStatus = translatedTask._originalData.status || translatedTask.status;
      translatedTask.status = t(`statuses.${originalStatus}`, { defaultValue: originalStatus });
    }

    if (translatedTask.priority && translateFields.includes('priority')) {
      const originalPriority = translatedTask._originalData.priority || translatedTask.priority;
      translatedTask.priority = t(`priorities.${originalPriority}`, { defaultValue: originalPriority });
    }

    if (translateFields.includes('title') && translatedTask.title && typeof translatedTask.title === 'string') {
      if (translatedTask.title.startsWith('key.')) {
        translatedTask.title = t(translatedTask.title.substring(4), { defaultValue: translatedTask.title });
      }
    }

    if (translateFields.includes('description') && translatedTask.description && typeof translatedTask.description === 'string') {
      if (translatedTask.description.startsWith('key.')) {
        translatedTask.description = t(translatedTask.description.substring(4), { defaultValue: translatedTask.description });
      }
    }

    return translatedTask;
  };

  const translateBackendData = (data, fieldMap = {}) => {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map(item => translateBackendData(item, fieldMap));
    }

    if (typeof data === 'object') {
      const result = { ...data };

      if (!result._originalData) {
        result._originalData = {};
      }

      Object.keys(fieldMap).forEach(field => {
        if (result[field] !== undefined) {
          result._originalData[field] = result[field];

          const translationKey = fieldMap[field];
          if (typeof translationKey === 'function') {
            result[field] = t(translationKey(result[field]), { defaultValue: result[field] });
          } else if (translationKey) {
            result[field] = t(`${translationKey}.${result[field]}`, { defaultValue: result[field] });
          }
        }
      });

      return result;
    }

    return data;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      changeLanguage,
      translate,
      translations,
      translateTaskContent,
      translateBackendData,
      i18n,
      t
    }}>
      {children}
    </LanguageContext.Provider>
  );
}; 