"use client";

import React, { useState, useEffect } from "react";
import { useSkeletonLoading } from "@/hooks/useProgressiveLoading";
import NewHeader from "@/components/layout/NewHeader";
import { Footer } from "@/components/layout";
import { getLandingPageContent } from "@/lib/content-config";
import { ContentErrorBoundary } from "@/components/ContentErrorBoundary";

export default function AppInstall() {
  const landingPageContent = getLandingPageContent();
  const skeleton = useSkeletonLoading();
  const { isVisible: isSkeletonVisible } = skeleton;
  const [selectedPlatform, setSelectedPlatform] = useState<"ios" | "android" | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; message: string | React.ReactNode }>(
    { title: "", message: "" }
  );

  useEffect(() => {
    // Feature-detect platform and browser
    const ua = (window.navigator.userAgent || "").toLowerCase();
    const platform = (window.navigator as any).platform || "";

    // iPhone / iPad / iPod or iPadOS desktop mode (MacIntel + touch)
    const iosDevice = /iphone|ipad|ipod/.test(ua) || (platform === "MacIntel" && (navigator as any).maxTouchPoints > 1);
    setIsIOS(!!iosDevice);

    // Detect Safari (exclude Chrome/Firefox/Edge on iOS which use different UA tokens)
    const isSafariBrowser = /safari/.test(ua) && !/crios|fxios|edgios|chrome|android/.test(ua);
    setIsSafari(!!isSafariBrowser);

    // Detect standalone mode (installed)
    const checkInstalled = () => {
      const ms = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
      const iosStandalone = (window.navigator as any).standalone === true;
      return !!ms || !!iosStandalone;
    };
    if (checkInstalled()) setIsInstalled(true);

    // beforeinstallprompt handler
    const onBeforeInstallPrompt = (e: any) => {
      try {
        e.preventDefault();
      } catch (err) {
        // ignore
      }
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.debug("PWA: beforeinstallprompt captured");
    };

    // appinstalled handler
    const onAppInstalled = () => {
      console.info("PWA: appinstalled event fired");
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
      try {
        console.log("analytics.event: pwa_install");
      } catch (_) {}
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", onAppInstalled as EventListener);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", onAppInstalled as EventListener);
    };
  }, []);

  const handleIOSInstall = () => {
    setSelectedPlatform("ios");

    if (isInstalled) {
      // Open app flow
      window.location.href = "/";
      return;
    }

    if (!isIOS) {
      setModalContent({ title: "iOS Device Required", message: "This installer works only on iPhone, iPad or iPod." });
      setShowModal(true);
      return;
    }

    if (!isSafari) {
      setModalContent({ title: "Safari Required", message: "Please open this page in Safari to install the app on iOS." });
      setShowModal(true);
      return;
    }

    // Show instructions modal (same UI as before)
    setModalContent({
      title: "iOS Installation Steps",
      message: (
        <ol className="space-y-3 text-left">
          <li className="flex gap-3">
            <span className="font-bold text-accent-pink">1.</span>
            <span>Open this page in Safari</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-accent-pink">2.</span>
            <span>Tap the Share button (⬆️)</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-accent-pink">3.</span>
            <span>Select &quot;Add to Home Screen&quot;</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-accent-pink">4.</span>
            <span>Tap Add</span>
          </li>
        </ol>
      )
    });
    setShowModal(true);
  };

  const handleAndroidInstall = async () => {
    setSelectedPlatform("android");

    if (isInstalled) {
      window.location.href = "/";
      return;
    }

    if (!isInstallable || !deferredPrompt) {
      setModalContent({
        title: "Install Not Available",
        message: "Install option not available. Make sure HTTPS, a valid service worker, and manifest are configured."
      });
      setShowModal(true);
      return;
    }

    try {
      // Show native prompt
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === "accepted") {
        console.info("PWA: user accepted installation");
        try { console.log("analytics.event: pwa_install_accepted"); } catch (_) {}
      } else {
        console.info("PWA: user dismissed installation");
      }
    } catch (err) {
      console.warn("PWA: prompt failed", err);
      setModalContent({ title: "Install Failed", message: "Could not show install prompt. Please try again." });
      setShowModal(true);
    } finally {
      // Prevent double prompts
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {isSkeletonVisible && (
        <div className="fixed inset-0 z-50 bg-white animate-pulse min-h-screen">
          <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="max-w-3xl mx-auto">
              <div className="h-10 bg-neutral-gray/20 rounded mb-6 w-1/3"></div>
              <div className="h-6 bg-neutral-gray/20 rounded mb-4 w-2/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="h-48 bg-neutral-gray/20 rounded"></div>
                <div className="h-48 bg-neutral-gray/20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ContentErrorBoundary sectionName="header">
        <NewHeader alwaysVisible />
      </ContentErrorBoundary>

      <main className="min-h-screen pt-16 md:pt-20">
        <div className="container mx-auto px-4 py-12 md:py-20">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-navy mb-4">
              Crensa App
            </h1>
            <p className="text-lg md:text-xl text-black font-semibold mb-8">
              Install our mobile app to enjoy a seamless streaming experience anywhere, anytime.
            </p>
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-navy font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold text-primary-navy">Crensa</span>
            </div>
          </div>

          {/* Installation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* iOS Card */}
            <div className="border-2 border-neutral-gray rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="240px" height="240px"><path fill="#eceff1" d="M16,42h16c5.523,0,10-4.477,10-10V16c0-5.523-4.477-10-10-10H16C10.477,6,6,10.477,6,16v16C6,37.523,10.477,42,16,42z"/><path fill="#ffc107" d="M12.783 17.974A0.762 0.762 0 1 0 12.783 19.498A0.762 0.762 0 1 0 12.783 17.974Z"/><path fill="#ff5722" d="M15.982 21.81l1.444-.61c.68-1.22 1.835-1.927 3.332-1.927.34 0 .659.043.962.113l1.372-.579c-.676-.333-1.451-.526-2.334-.526C18.368 18.281 16.663 19.594 15.982 21.81zM13.297 22.944L13.297 21.375 12.273 21.375 12.273 23.377z"/><path fill="#f44336" d="M13.297 25.733L13.297 22.944 12.273 23.377 12.273 26.165zM16.742 24.148c0-1.169.246-2.163.684-2.948l-1.444.61c-.214.696-.333 1.476-.333 2.338 0 .201.028.382.04.574l1.062-.449C16.75 24.23 16.742 24.192 16.742 24.148zM30.421 18.5c-.279.086-.537.195-.774.327L30.421 18.5zM23.092 18.807l-1.372.579c1.027.237 1.828.863 2.35 1.796l1.022-.432C24.624 19.878 23.941 19.226 23.092 18.807z"/><path fill="#e91e63" d="M13.297 28.521L13.297 25.733 12.273 26.165 12.273 28.953zM30.421 18.5l-.774.327c-.983.547-1.577 1.464-1.577 2.58 0 .302.046.571.117.825l1.032-.436c-.034-.132-.056-.27-.056-.42 0-1.227 1.117-2.117 2.734-2.117.796 0 1.467.213 1.958.579l1.048-.443c-.694-.684-1.735-1.113-2.974-1.113C31.381 18.281 30.876 18.36 30.421 18.5zM16.75 24.274l-1.062.449c.059.959.26 1.811.597 2.536l1.004-.424C16.954 26.121 16.766 25.26 16.75 24.274zM25.092 20.751l-1.022.432c.381.682.603 1.532.658 2.51l1.061-.448C25.695 22.297 25.467 21.452 25.092 20.751z"/><g><path fill="#9c27b0" d="M25.609 26.108c.146-.602.242-1.247.242-1.96 0-.316-.033-.609-.063-.904l-1.061.448c.009.153.03.296.03.456 0 .968-.177 1.809-.481 2.523L25.609 26.108zM17.29 26.834l-1.004.424c.408.879 1.008 1.568 1.777 2.038l1.258-.531C18.42 28.427 17.727 27.764 17.29 26.834zM13.297 28.521L12.273 28.953 12.273 29.789 13.297 29.789zM29.22 21.795l-1.032.436c.245.866.915 1.471 2.129 1.889l1.6-.676-.338-.085C30.122 22.995 29.406 22.527 29.22 21.795zM34.719 21.273h1.078c-.05-.731-.379-1.373-.893-1.879l-1.048.443C34.328 20.189 34.635 20.684 34.719 21.273z"/></g><g><path fill="#3f51b5" d="M25.609 26.108l-1.333.563c-.629 1.476-1.85 2.36-3.519 2.36-.528 0-1.001-.103-1.437-.267l-1.258.531c.752.459 1.648.728 2.695.728C23.3 30.023 25.019 28.541 25.609 26.108zM28.828 26.859H27.75c.026.368.127.705.264 1.021l.989-.418C28.919 27.273 28.853 27.074 28.828 26.859zM32.695 23.641l-.779-.196-1.6.676c.234.081.487.156.762.224l1.289.328c.714.176 1.257.399 1.659.669l1.205-.509C34.703 24.318 33.878 23.934 32.695 23.641z"/></g><g><path fill="#03a9f4" d="M29.003 27.463l-.989.418c.377.87 1.139 1.531 2.166 1.873l1.692-.714C30.493 29.007 29.415 28.396 29.003 27.463zM35.914 27.333c.035-.193.063-.39.063-.598 0-.784-.234-1.404-.745-1.902l-1.205.509c.579.39.856.883.856 1.51 0 .393-.131.75-.348 1.063L35.914 27.333z"/></g><path fill="#009688" d="M35.914,27.333l-1.379,0.583c-0.472,0.682-1.394,1.132-2.55,1.132c-0.039,0-0.074-0.006-0.112-0.007l-1.692,0.714c0.514,0.171,1.086,0.269,1.71,0.269C34.098,30.023,35.615,28.964,35.914,27.333z"/></svg>
                </div>

                <h2 className="text-2xl font-bold text-primary-navy mb-4">
                  iOS App
                </h2>

                <p className="text-gray-800 mb-6">
                  Install Crensa on your iPhone or iPad for quick access and offline features.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <span className="text-accent-pink font-bold mt-1">✓</span>
                    <span className="text-left">Works on iPhone & iPad</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent-pink font-bold mt-1">✓</span>
                    <span className="text-left">Fast and responsive</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent-pink font-bold mt-1">✓</span>
                    <span className="text-left">Push notifications</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent-pink font-bold mt-1">✓</span>
                    <span className="text-left">Home screen icon</span>
                  </div>
                </div>

                <button
                  onClick={handleIOSInstall}
                  className={`w-full btn-primary py-3 rounded-lg font-semibold transition-all duration-200 ${
                    selectedPlatform === "ios"
                      ? "bg-accent-pink text-white"
                      : ""
                  }`}
                >
                  {isInstalled ? "Open App" : "Install on iOS"}
                </button>
              </div>
            </div>

            {/* Android Card */}
            <div className="border-2 border-neutral-gray rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="240px" height="240px"><path fill="#7cb342" d="M12 29c0 1.1-.9 2-2 2s-2-.9-2-2v-9c0-1.1.9-2 2-2s2 .9 2 2V29zM40 29c0 1.1-.9 2-2 2s-2-.9-2-2v-9c0-1.1.9-2 2-2s2 .9 2 2V29zM22 40c0 1.1-.9 2-2 2s-2-.9-2-2v-9c0-1.1.9-2 2-2s2 .9 2 2V40zM30 40c0 1.1-.9 2-2 2s-2-.9-2-2v-9c0-1.1.9-2 2-2s2 .9 2 2V40z"/><path fill="#7cb342" d="M14 18v15c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V18H14zM24 8c-6 0-9.7 3.6-10 8h20C33.7 11.6 30 8 24 8zM20 13.6c-.6 0-1-.4-1-1 0-.6.4-1 1-1s1 .4 1 1C21 13.1 20.6 13.6 20 13.6zM28 13.6c-.6 0-1-.4-1-1 0-.6.4-1 1-1s1 .4 1 1C29 13.1 28.6 13.6 28 13.6z"/><path fill="#7cb342" d="M28.3 10.5c-.2 0-.4-.1-.6-.2-.5-.3-.6-.9-.3-1.4l1.7-2.5c.3-.5.9-.6 1.4-.3.5.3.6.9.3 1.4l-1.7 2.5C29 10.3 28.7 10.5 28.3 10.5zM19.3 10.1c-.3 0-.7-.2-.8-.5l-1.3-2.1c-.3-.5-.2-1.1.3-1.4.5-.3 1.1-.2 1.4.3l1.3 2.1c.3.5.2 1.1-.3 1.4C19.7 10 19.5 10.1 19.3 10.1z"/></svg>
                </div>

                <h2 className="text-2xl font-bold text-primary-navy mb-4">
                  Android App
                </h2>

                <p className="text-gray-800 mb-6">
                  Install Crensa on your Android device for seamless entertainment on the go.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <span className="text-accent-pink font-bold mt-1">✓</span>
                    <span className="text-left">All Android devices</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent-pink font-bold mt-1">✓</span>
                    <span className="text-left">Optimized performance</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent-pink font-bold mt-1">✓</span>
                    <span className="text-left">Real-time notifications</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-accent-pink font-bold mt-1">✓</span>
                    <span className="text-left">Widget support</span>
                  </div>
                </div>

                <button
                  onClick={handleAndroidInstall}
                  className={`w-full btn-primary py-3 rounded-lg font-semibold transition-all duration-200 ${
                    selectedPlatform === "android"
                      ? "bg-accent-pink text-white"
                      : ""
                  }`}
                >
                  {isInstalled ? "Open App" : "Install on Android"}
                </button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-primary-navy text-center mb-12">
              Why Install the App?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary-navy"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-primary-navy mb-2">
                  Instant Access
                </h3>
                <p className="text-gray-800">
                  Launch the app instantly from your home screen without opening a browser.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary-navy"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zm-5.04-6.71l-2.75 3.54-2.63-3.44c-.39-.51-1.35-.51-1.74 0l-2.83 3.71C2.5 15.56 2 15.56 2 16.5V20h16v-3.48c0-.95-.54-1.79-1.36-2.23z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-primary-navy mb-2">
                  Better Experience
                </h3>
                <p className="text-gray-800">
                  Enjoy an optimized interface designed specifically for mobile devices.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary-navy"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm0-10a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-primary-navy mb-2">
                  Notifications
                </h3>
                <p className="text-gray-800">
                  Get push notifications for new content and updates from creators you follow.
                </p>
              </div>
            </div>
          </div>

          {/* Installation Guide Section */}
          <div className="max-w-4xl mx-auto bg-neutral-gray/10 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary-navy mb-8">
              Installation Guide
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* iOS Instructions */}
              <div>
                <h3 className="font-bold text-lg text-primary-navy mb-4 flex items-center gap-2">
                  <span>📱</span> Safari (iOS)
                </h3>
                <ol className="space-y-3 text-gray-800">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary-navy">1.</span>
                    <span className="text-accent-pink font-semibold">Open this page in Safari</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary-navy">2.</span>
                    <span className="text-accent-pink font-semibold">Tap the Share button (⬆️)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary-navy">3.</span>
                    <span className="text-accent-pink font-semibold">Select Add to Home Screen</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary-navy">4.</span>
                    <span className="text-accent-pink font-semibold">Customize name and tap Add</span>
                  </li>
                </ol>
              </div>

              {/* Android Instructions */}
              <div>
                <h3 className="font-bold text-lg text-primary-navy mb-4 flex items-center gap-2">
                  <span>🤖</span> Chrome (Android)
                </h3>
                <ol className="space-y-3 text-gray-800">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary-navy">1.</span>
                    <span className="text-accent-pink font-semibold">Open in Chrome or default browser</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary-navy">2.</span>
                    <span className="text-accent-pink font-semibold">Tap menu (⋮) or Install icon</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary-navy">3.</span>
                    <span className="text-accent-pink font-semibold">Select Install app</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary-navy">4.</span>
                    <span className="text-accent-pink font-semibold">Confirm and launch the app</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold text-primary-navy mb-4">{modalContent.title}</h2>
            <div className="text-gray-800 mb-6 text-sm md:text-base">
              {modalContent.message}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full btn-primary py-3 rounded-lg font-semibold transition-all duration-200"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <ContentErrorBoundary sectionName="footer">
        <Footer content={landingPageContent.footer} />
      </ContentErrorBoundary>
    </div>
  );
}
