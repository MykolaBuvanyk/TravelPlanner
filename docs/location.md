# Current location

The app requests foreground-only location access after the user taps `Show current location` or `Use current location`. It never requests background access and does not persist the device position.

The map shows the native user-location indicator and centers the camera after access is granted. The add-place form copies latitude and longitude into the form for review before saving. Android uses the system LocationManager to avoid an incompatibility in the Fused Location Provider on the current dependency set. A denied, blocked, unavailable, disabled, or timed-out location request is presented with a recovery action where possible.

Native configuration includes iOS `LocationWhenInUse`, an English iOS usage description, and Android coarse and fine foreground permissions. Pods were synchronized after the Podfile change; native builds and device verification are deferred until requested.
