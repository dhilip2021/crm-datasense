"use client";
import { useState, useEffect } from "react";
import { listenForForegroundNotifications } from "@/utils/firebaseForeground";

const NotificationPopup = () => {
  const [popups, setPopups] = useState([]);

  useEffect(() => {
    listenForForegroundNotifications((payload) => {
      const { title, body, image } = payload.notification;

      const newPopup = {
        id: Date.now() + Math.random(),
        title,
        body,
        image,
      };

      setPopups((prev) => [...prev, newPopup]);

      // Auto-remove after 10 sec
      setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== newPopup.id));
      }, 10000);
    });
  }, []);

  const closePopup = (id) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  };

  if (popups.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
      {popups.map((popup) => (
        <div
          key={popup.id}
          className="bg-white shadow-xl p-4 rounded-xl border w-72 flex gap-3 relative animate-slide-in"
        >
          <button
            onClick={() => closePopup(popup.id)}
            className="absolute top-2 right-2 text-gray-500 hover:text-black text-sm"
          >
            ✕
          </button>

          {popup.image && (
            <img
              src={popup.image}
              alt="icon"
              className="w-12 h-12 rounded-md object-cover"
            />
          )}

          <div>
            <h4 className="font-bold text-gray-900">{popup.title}</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {popup.body}
            </p>
          </div>

          <style jsx>{`
            .animate-slide-in {
              animation: slideIn 0.4s ease-out;
            }
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateX(20px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
};

export default NotificationPopup;
