import React, { useState, useEffect } from "react";
import { colors } from "../config/colors";

interface LocationData {
  latitude: number;
  longitude: number;
  country?: string | null;
  city?: string | null;
  timestamp: number;
}

// Reverse geocoding function to get country and city from coordinates
const reverseGeocode = async (latitude: number, longitude: number): Promise<{ country: string | null; city: string | null }> => {
  try {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'NestaToysPlatform/1.0' // Required by Nominatim
        }
      }
    );
    
    if (!response.ok) {
      return { country: null, city: null };
    }
    
    const data = await response.json();
    const address = data.address || {};
    
    // Extract country and city from the address object
    const country = address.country || null;
    // Try different city fields (city, town, village, municipality)
    const city = address.city || address.town || address.village || address.municipality || address.county || null;
    
    return { country, city };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return { country: null, city: null };
  }
};

const LocationRequest: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  useEffect(() => {
    // Check cookie consent first
    const cookieConsentStatus = localStorage.getItem("cookieConsent");
    if (cookieConsentStatus === null) {
      // Show cookie consent first
      const timer = setTimeout(() => {
        setShowCookieConsent(true);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Check if we've already asked for location or if permission was denied
    const locationPermission = localStorage.getItem("locationPermission");
    const locationData = localStorage.getItem("locationData");

    // Don't show if permission was previously denied or if we have recent location data
    if (locationPermission === "denied") {
      return;
    }

    // If we have location data less than 24 hours old, don't ask again
    if (locationData) {
      try {
        const data: LocationData = JSON.parse(locationData);
        const hoursSinceUpdate = (Date.now() - data.timestamp) / (1000 * 60 * 60);
        if (hoursSinceUpdate < 24) {
          return;
        }
      } catch {
        // Invalid data, continue to show prompt
      }
    }

    // Show location prompt after a short delay
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const requestLocation = () => {
    setIsRequesting(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsRequesting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        // Get country and city using reverse geocoding
        const { country, city } = await reverseGeocode(latitude, longitude);
        
        const locationData: LocationData = {
          latitude,
          longitude,
          country,
          city,
          timestamp: Date.now(),
        };

        // Store location data and permission status
        localStorage.setItem("locationData", JSON.stringify(locationData));
        localStorage.setItem("locationPermission", "granted");

        setShowPrompt(false);
        setIsRequesting(false);

        // You can send this to your backend if needed
        // AuthService.updateLocation(locationData.latitude, locationData.longitude);
      },
      (err) => {
        setIsRequesting(false);
        
        if (err.code === err.PERMISSION_DENIED) {
          localStorage.setItem("locationPermission", "denied");
          setError("Location permission denied. You can enable it later in your browser settings.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("Location information is unavailable.");
        } else if (err.code === err.TIMEOUT) {
          setError("Location request timed out.");
        } else {
          setError("An error occurred while retrieving your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleDeny = () => {
    localStorage.setItem("locationPermission", "denied");
    setShowPrompt(false);
  };

  const handleCookieAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowCookieConsent(false);
    // After cookie consent, show location prompt
    setTimeout(() => {
      setShowPrompt(true);
    }, 500);
  };

  const handleCookieReject = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setShowCookieConsent(false);
    // After cookie consent, show location prompt
    setTimeout(() => {
      setShowPrompt(true);
    }, 500);
  };

  if (!showPrompt && !showCookieConsent) return null;

  // Cookie Consent Popup
  if (showCookieConsent) {
    return (
      <div
        className="fixed top-4 left-4 z-[99999] max-w-xs animate-slide-in-left"
        style={{ backgroundColor: colors.mediumDarkGray }}
      >
        <div
          className="shadow-xl rounded-lg px-4 pt-4 pb-4 animate-fade-in"
          style={{ backgroundColor: colors.mediumDarkGray, border: `1px solid ${colors.limeGreen}50` }}
        >
          <div className="flex items-start mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
              style={{ backgroundColor: colors.limeGreen + "20" }}
            >
              <svg
                className="w-4 h-4"
                style={{ color: colors.limeGreen }}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="text-sm font-semibold mb-1"
                style={{ color: colors.lightGray }}
              >
                Cookie Consent
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: colors.lightGray }}
              >
                We use cookies to enhance your experience. By clicking "Accept", you consent to our use of cookies.
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCookieReject}
              className="flex-1 px-2 py-1.5 rounded-md text-xs focus:outline-none transition-all duration-200"
              style={{
                backgroundColor: colors.darkerGray,
                color: colors.lightGray,
                border: `1px solid ${colors.darkGray}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.darkGray;
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.darkerGray;
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Reject
            </button>
            <button
              onClick={handleCookieAccept}
              className="flex-1 px-2 py-1.5 rounded-md text-xs focus:outline-none transition-all duration-200"
              style={{
                backgroundColor: colors.limeGreen,
                color: colors.veryDarkGray,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#9de000";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.limeGreen;
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Location Request Popup (Top Left)
  return (
    <div
      className="fixed top-4 left-4 z-[99999] max-w-xs animate-slide-in-left"
    >
      <div
        className="shadow-xl rounded-lg px-4 pt-4 pb-4 animate-fade-in"
        style={{ backgroundColor: colors.mediumDarkGray, border: `1px solid ${colors.limeGreen}50` }}
      >
        <div className="flex items-start mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
            style={{ backgroundColor: colors.limeGreen + "20" }}
          >
            <svg
              className="w-4 h-4"
              style={{ color: colors.limeGreen }}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-semibold mb-1"
              style={{ color: colors.lightGray }}
            >
              Share Your Location
            </h3>
            <p
              className="text-xs leading-relaxed"
              style={{ color: colors.lightGray }}
            >
              We'd like to use your location to provide a better experience and ensure compliance with regional regulations.
            </p>
          </div>
        </div>

        {error && (
          <div
            className="mb-3 p-2 rounded-md text-xs animate-fade-in"
            style={{
              backgroundColor: colors.red + "20",
              color: colors.red,
            }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDeny}
            disabled={isRequesting}
            className="flex-1 px-2 py-1.5 rounded-md text-xs focus:outline-none transition-all duration-200"
            style={{
              backgroundColor: colors.darkerGray,
              color: colors.lightGray,
              border: `1px solid ${colors.darkGray}`,
            }}
            onMouseEnter={(e) => {
              if (!isRequesting) {
                e.currentTarget.style.backgroundColor = colors.darkGray;
                e.currentTarget.style.transform = "scale(1.02)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isRequesting) {
                e.currentTarget.style.backgroundColor = colors.darkerGray;
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            Not Now
          </button>
          <button
            onClick={requestLocation}
            disabled={isRequesting}
            className="flex-1 px-2 py-1.5 rounded-md text-xs focus:outline-none transition-all duration-200 flex items-center justify-center"
            style={{
              backgroundColor: isRequesting ? colors.darkGray : colors.limeGreen,
              color: colors.veryDarkGray,
            }}
            onMouseEnter={(e) => {
              if (!isRequesting) {
                e.currentTarget.style.backgroundColor = "#9de000";
                e.currentTarget.style.transform = "scale(1.02)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isRequesting) {
                e.currentTarget.style.backgroundColor = colors.limeGreen;
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            {isRequesting ? (
              <>
                <svg
                  className="animate-spin h-3 w-3 mr-1"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Getting...
              </>
            ) : (
              "Allow"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationRequest;

