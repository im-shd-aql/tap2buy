"use client";

import { useState, useCallback } from "react";
import WelcomeStep from "./welcome-step";
import PhoneStep from "./phone-step";
import StoreNameStep from "./store-name-step";
import CategoryStep from "./category-step";
import LogoStep from "./logo-step";
import ProductStep from "./product-step";
import PaymentStep from "./payment-step";
import DeliveryStep from "./delivery-step";
import ReadyStep from "./ready-step";
import { Check } from "lucide-react";

const CONFETTI_COLORS = [
  "bg-indigo-500",
  "bg-pink-500",
  "bg-yellow-400",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-blue-400",
  "bg-red-500",
  "bg-orange-400",
  "bg-teal-400",
  "bg-indigo-400",
  "bg-pink-400",
  "bg-emerald-400",
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [animationClass, setAnimationClass] = useState("animate-step-in");

  // Shared state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeId, setStoreId] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Product celebration overlay
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationProduct, setCelebrationProduct] = useState<{
    name: string;
    price: number;
    image: string;
  } | null>(null);

  const goToStep = useCallback(
    (next: number) => {
      if (animating) return;
      setAnimating(true);
      setAnimationClass("animate-step-out");

      setTimeout(() => {
        setCurrentStep(next);
        setAnimationClass("animate-step-in");
        setTimeout(() => setAnimating(false), 350);
      }, 250);
    },
    [animating]
  );

  function handleAuthenticated(t: string, uid: string) {
    setToken(t);
    setUserId(uid);
    goToStep(3);
  }

  function handleStoreCreated(id: string, slug: string) {
    setStoreId(id);
    setStoreSlug(slug);
    goToStep(5);
  }

  function handleLogoNext(url?: string) {
    if (url) setLogoUrl(url);
    goToStep(6);
  }

  function handleProductCreated(product: {
    name: string;
    price: number;
    image: string;
  }) {
    setCelebrationProduct(product);
    setShowCelebration(true);

    setTimeout(() => {
      setShowCelebration(false);
      goToStep(7);
    }, 2500);
  }

  // Show progress bar on steps 2-8
  const showProgress = currentStep >= 2 && currentStep <= 8;
  const progress = ((currentStep - 1) / 8) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Progress bar */}
      {showProgress && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
          <div
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          <div key={currentStep} className={animationClass}>
            {currentStep === 1 && (
              <WelcomeStep onNext={() => goToStep(2)} />
            )}

            {currentStep === 2 && (
              <PhoneStep
                name={name}
                setName={setName}
                phone={phone}
                setPhone={setPhone}
                onAuthenticated={handleAuthenticated}
              />
            )}

            {currentStep === 3 && (
              <StoreNameStep
                storeName={storeName}
                setStoreName={setStoreName}
                onNext={() => goToStep(4)}
              />
            )}

            {currentStep === 4 && (
              <CategoryStep
                storeName={storeName}
                token={token}
                onStoreCreated={handleStoreCreated}
              />
            )}

            {currentStep === 5 && (
              <LogoStep
                storeName={storeName}
                storeId={storeId}
                token={token}
                onNext={handleLogoNext}
              />
            )}

            {currentStep === 6 && (
              <ProductStep
                storeId={storeId}
                token={token}
                onProductCreated={handleProductCreated}
              />
            )}

            {currentStep === 7 && (
              <PaymentStep token={token} onNext={() => goToStep(8)} />
            )}

            {currentStep === 8 && (
              <DeliveryStep
                storeId={storeId}
                token={token}
                onNext={() => goToStep(9)}
              />
            )}

            {currentStep === 9 && (
              <ReadyStep
                storeName={storeName}
                storeSlug={storeSlug}
                logoUrl={logoUrl}
              />
            )}
          </div>
        </div>
      </div>

      {/* Product celebration overlay */}
      {showCelebration && celebrationProduct && (
        <div
          className="fixed inset-0 z-[100] bg-white/95 flex flex-col items-center justify-center px-6"
          onClick={() => {
            setShowCelebration(false);
            goToStep(7);
          }}
        >
          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {CONFETTI_COLORS.map((color, i) => (
              <div
                key={i}
                className={`absolute w-2.5 h-2.5 rounded-full ${color} animate-confetti`}
                style={{
                  left: `${5 + (i * 7.5) % 90}%`,
                  top: `${-3 - (i % 3) * 4}%`,
                  animationDelay: `${i * 0.07}s`,
                  animationDuration: `${1.2 + (i % 3) * 0.3}s`,
                }}
              />
            ))}
          </div>

          {/* Checkmark */}
          <div className="animate-scale-circle mb-5">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8">
                <path
                  d="M5 13l4 4L19 7"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-checkmark"
                />
              </svg>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-4 animate-fade-up">
            Your first product is live!
          </h3>

          {/* Product card */}
          <div className="animate-celebrate bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-[200px]">
            <img
              src={celebrationProduct.image}
              alt={celebrationProduct.name}
              className="w-full aspect-square object-cover"
            />
            <div className="p-3">
              <p className="font-medium text-sm truncate">
                {celebrationProduct.name}
              </p>
              <p className="text-indigo-600 font-semibold text-sm mt-0.5">
                LKR {celebrationProduct.price.toLocaleString()}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-6">Tap to continue</p>
        </div>
      )}
    </div>
  );
}
