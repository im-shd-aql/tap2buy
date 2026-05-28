"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLang } from "@/hooks/useLang";

export default function BlogPage() {
  const { lang } = useLang();

  const blogPosts = [
    {
      id: 1,
      titleEn: "10 Tips to Boost Your E-Commerce Sales",
      titleSi: "ඔබගේ ඉ-වාණිජ විකාශන ඉහළ දැමීමට 10 ඉඟි",
      descriptionEn:
        "Learn proven strategies to increase your online store's revenue and customer engagement.",
      descriptionSi:
        "ඔබගේ අන්තර්ජාල ගබඩාවේ ඉපැයුම් සහ පාරිභෝගික සම්බන්ධතා වැඩි කිරීමට ඔප්පු කරන ලද ক෌ශල ඉගෙන ගන්න.",
      dateEn: "March 15, 2024",
      dateSi: "2024 මාර්තු 15",
      readTimeEn: "5 min read",
      readTimeSi: "මිනිත්තු 5",
    },
    {
      id: 2,
      titleEn: "Why WhatsApp is Essential for Your Business",
      titleSi: "ඔබගේ ව්‍යවසාය සඳහා WhatsApp ඇත්ත වශයෙන්ම අත්‍යවශ්‍ය",
      descriptionEn:
        "Discover how to leverage WhatsApp for better customer communication and higher conversion rates.",
      descriptionSi:
        "සුංවාදනයට පූර්ණ ග්‍රාහක සම්මතිය සඳහා WhatsApp භාවිතා කරන ආකාරය සොයා ගන්න.",
      dateEn: "March 10, 2024",
      dateSi: "2024 මාර්තු 10",
      readTimeEn: "4 min read",
      readTimeSi: "මිනිත්තු 4",
    },
    {
      id: 3,
      titleEn: "Mobile-First Shopping: The Sri Lankan Opportunity",
      titleSi: "ගතිශීල-প්‍රතිමුඛ කෙනෙහි සැපොයුම: ශ්‍රී ලංකා අවස්ථාව",
      descriptionEn:
        "Understand why mobile commerce is the future of retail in South Asia and how to capitalize on it.",
      descriptionSi:
        "දකුණු ආසියාවේ ඛුද්‍රවෙළඳ දෙපාර්තමේන්තුවේ ගතිශීල වාණිජ්‍යය ඔබ භවිතා කරන ආකාරය තේරුම් ගන්න.",
      dateEn: "March 5, 2024",
      dateSi: "2024 මාර්තු 5",
      readTimeEn: "6 min read",
      readTimeSi: "මිනිත්තු 6",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-neutral-50/50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <h1 className="text-4xl font-bold text-neutral-900 sm:text-5xl">
              {lang === "en" ? "Tap2Buy Blog" : "Tap2Buy ගිණුම්"}
            </h1>
            <p className="mt-4 text-lg text-stone-600">
              {lang === "en"
                ? "Tips, stories, and insights for Sri Lankan entrepreneurs"
                : "ශ්‍රී ලංකා ව්‍යවසායකයින් සඳහා ඉඟි, කතා සහ අවබෝධ"}
            </p>
          </motion.div>

          {/* Blog Posts */}
          <div className="space-y-8">
            {blogPosts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="mb-3 text-2xl font-bold text-neutral-900">
                      {lang === "en" ? post.titleEn : post.titleSi}
                    </h2>
                    <p className="mb-4 text-stone-600">
                      {lang === "en"
                        ? post.descriptionEn
                        : post.descriptionSi}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-stone-500">
                      <span>{lang === "en" ? post.dateEn : post.dateSi}</span>
                      <span>•</span>
                      <span>{lang === "en" ? post.readTimeEn : post.readTimeSi}</span>
                    </div>
                  </div>
                  <button className="mt-2 flex-shrink-0 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-all hover:shadow-lg hover:scale-105">
                    {lang === "en" ? "Read" : "කියවන්න"}
                  </button>
                </div>
              </motion.article>
            ))}
          </div>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 rounded-xl bg-gradient-to-r from-primary to-primary-dark p-8 text-center text-white sm:p-12"
          >
            <h2 className="mb-4 text-3xl font-bold">
              {lang === "en"
                ? "Stay Updated"
                : "යාවත්කාල එනතුර සිටින්න"}
            </h2>
            <p className="mb-8 text-white/90">
              {lang === "en"
                ? "Get the latest tips and insights for growing your business"
                : "ඔබගේ ව්‍යවසාය වර්ධනය සඳහා නවතම ඉඟි සහ තොරතුරු ලබා ගන්න"}
            </p>
            <a
              href="https://wa.me/94XXXXXXXXX?text=Hi!%20I%20want%20to%20receive%20Tap2Buy%20updates"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-white px-8 py-3 font-bold text-primary transition-all hover:shadow-lg hover:scale-105"
            >
              {lang === "en" ? "Join Our Newsletter" : "අපගේ පत්‍ර ලැයිස්තුවට එක්වන්න"}
            </a>
          </motion.section>
        </div>
      </main>
      <Footer />
    </>
  );
}
