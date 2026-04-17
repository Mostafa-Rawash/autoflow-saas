import React from 'react';

const ConversationDetail = () => {
  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Messages */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="glass-dark p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-whatsapp/20 flex items-center justify-center">
            📱
          </div>
          <div>
            <p className="font-bold">مستخدم</p>
            <p className="text-xs text-gray-400">واتس آب</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">لا توجد رسائل بعد</p>
        </div>

        {/* Input */}
        <div className="p-4 glass-dark">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="اكتب رسالتك..."
              className="flex-1 bg-dark-800 border border-dark-600 rounded-lg py-2 px-4"
            />
            <button className="btn-primary">إرسال</button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block w-80 glass-dark p-4">
        <h3 className="font-bold mb-4">معلومات المحادثة</h3>
        <p className="text-gray-400 text-sm">
          تفاصيل المحادثة ستظهر هنا
        </p>
      </div>
    </div>
  );
};

export default ConversationDetail;