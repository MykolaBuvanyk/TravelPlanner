# Saved places map

The Map tab displays saved places or a selected trip, with green pins for places visited in that trip. Tap a pin to preview it and open its details. Fit places frames the current selection. The initial camera is centered on Lviv; this is not the device location.

## Native setup

iOS uses the default Apple Maps provider. No Google Maps key is required on iOS.

Android requires a Google Cloud project with billing and Maps SDK for Android enabled. Set `GOOGLE_MAPS_API_KEY` in your local user Gradle properties (`~/.gradle/gradle.properties`) or in the environment used to build the app. The app Gradle configuration passes it to the Android manifest; do not commit the key into the project. Restrict the key to Maps SDK for Android and the Android application ID `com.travelplanner` plus the SHA-1 fingerprints for your signing certificates. Debug and release certificates differ.

Without a valid key, Android map tiles will not load. Use a device or emulator with Google Play services. A native rebuild is needed after changing the key. Native builds and device verification have not been run for this stage.

Official setup: https://github.com/react-native-maps/react-native-maps/blob/master/docs/installation.md

## Manual checks for a requested verification pass

- Open Map with no saved places: the empty message appears and the map stays interactive.
- Save one place and several distant places; Fit places should frame the relevant coordinates.
- Open a place from Details: its pin is centered and its preview is shown, including on repeated visits.
- Open a trip from Trip Details: only its places are shown, with visited state scoped to that trip.
- Tap a marker, open details, close the preview, and switch between All places and Active trip.
- Delete a selected place or trip, then return to Map: no stale preview or crash should occur.
- Check both platforms, rotation, large text, attribution visibility, and unavailable network/map tiles.

Location permissions and device positioning are intentionally deferred to the next stage.
