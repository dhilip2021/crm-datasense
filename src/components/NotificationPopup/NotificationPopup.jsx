"use client";
import { useState, useEffect } from "react";
import { listenForForegroundNotifications } from "@/utils/firebaseForeground";

const NotificationPopup = () => {
  const [popup, setPopup] = useState(null);

   const closePopup = () => setPopup(null);
  useEffect(() => {
    listenForForegroundNotifications((payload) => {
      const { title, body, image } = payload.notification;

      setPopup({
        title,
        body,
        image,
      });

      setTimeout(() => setPopup(null), 10000); // auto hide
    });
  }, []);

  if (!popup) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] animate-slide-in">
      <div className="bg-white shadow-xl p-4 rounded-xl border w-72 flex gap-3">
        <button
          onClick={closePopup}
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
          <p className="text-sm text-gray-600">{popup.body}</p>
        </div>
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
  );
};

export default NotificationPopup;
