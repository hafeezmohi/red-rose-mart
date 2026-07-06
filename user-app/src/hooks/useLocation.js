import { useState } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export function useLocation() {
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [address, setAddress] = useState("");
  const [verified, setVerified] = useState(false);

  const isKagaznagarAddress = (text = "") => {
    const value = text.toLowerCase();
    return (
      value.includes("kagaznagar") ||
      value.includes("kaghaznagar")
    );
  };

  const detectLocation = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please allow location access to continue."
        );
        setLoading(false);
        return false;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode.length > 0) {
        const place = geocode[0];
        const formatted = [
          place.name,
          place.street,
          place.district,
          place.city,
          place.region,
          place.postalCode,
        ]
          .filter(Boolean)
          .join(", ");

        const city = (place.city || "").toLowerCase();
        const district = (place.district || "").toLowerCase();
        const formattedLower = formatted.toLowerCase();

        const isKagaznagar =
          city.includes("kagaznagar") ||
          district.includes("kagaznagar") ||
          formattedLower.includes("kagaznagar");

        if (!isKagaznagar) {
          setAddress("");
          setCoordinates(null);
          setVerified(false);
          Alert.alert(
            "Not Deliverable",
            "Sorry, we deliver only in Kagaznagar, Telangana."
          );
          setLoading(false);
          return false;
        }

        setAddress(formatted);
        setCoordinates({ lat: latitude, lng: longitude });
        setVerified(true);
        setLoading(false);
        return { formatted, lat: latitude, lng: longitude };
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Location Error",
        "Could not detect your location. Please enter manually."
      );
    } finally {
      setLoading(false);
    }
    return false;
  };

  return {
    loading,
    coordinates,
    setCoordinates,
    address,
    setAddress,
    verified,
    setVerified,
    isKagaznagarAddress,
    detectLocation,
  };
}
