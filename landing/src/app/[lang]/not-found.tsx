"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Home, ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";

export default function NotFound() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-outfit">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center space-y-8 relative z-10"
      >
        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
          <Search className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-blue-600">404</p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Page not found
          </h1>
          <p className="text-slate-500 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/${lang}`}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.97] transition-all text-sm"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
